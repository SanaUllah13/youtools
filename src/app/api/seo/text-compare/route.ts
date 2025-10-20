import { NextRequest, NextResponse } from 'next/server';
import { compareBody } from '@/lib/validators';
import { guard } from '@/lib/limit';
import * as Diff from 'diff';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const v = compareBody.safeParse(body);
    if (!v.success) {
      return NextResponse.json({ error: 'Invalid input', details: v.error.errors }, { status: 400 });
    }

    const { a, b } = v.data;

    // Generate different types of diffs
    const wordDiff = Diff.diffWords(a, b);
    const charDiff = Diff.diffChars(a, b);
    const lineDiff = Diff.diffLines(a, b);
    const sentenceDiff = Diff.diffSentences(a, b);

    // Calculate similarity metrics
    const wordsA = a.split(/\s+/).length;
    const wordsB = b.split(/\s+/).length;
    const charsA = a.length;
    const charsB = b.length;

    // Count changes for similarity calculation
    let addedWords = 0;
    let removedWords = 0;
    let unchangedWords = 0;

    wordDiff.forEach(part => {
      const wordCount = part.value.split(/\s+/).filter(w => w.trim()).length;
      if (part.added) {
        addedWords += wordCount;
      } else if (part.removed) {
        removedWords += wordCount;
      } else {
        unchangedWords += wordCount;
      }
    });

    // Calculate similarity percentage
    const totalWords = Math.max(wordsA, wordsB);
    const similarity = totalWords > 0 ? Math.round((unchangedWords / totalWords) * 100) : 0;

    // Process diffs for frontend display
    const processedWordDiff = wordDiff.map(part => ({
      type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
      value: part.value,
      count: part.count || 0
    }));

    const processedCharDiff = charDiff.map(part => ({
      type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
      value: part.value,
      count: part.count || 0
    }));

    const processedLineDiff = lineDiff.map(part => ({
      type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
      value: part.value,
      count: part.count || 0
    }));

    return NextResponse.json({
      similarity: {
        percentage: similarity,
        details: {
          unchangedWords,
          addedWords,
          removedWords,
          totalWords
        }
      },
      statistics: {
        textA: {
          characters: charsA,
          words: wordsA,
          lines: a.split('\n').length
        },
        textB: {
          characters: charsB,
          words: wordsB,
          lines: b.split('\n').length
        },
        difference: {
          characters: Math.abs(charsA - charsB),
          words: Math.abs(wordsA - wordsB),
          lines: Math.abs(a.split('\n').length - b.split('\n').length)
        }
      },
      diffs: {
        words: processedWordDiff,
        characters: processedCharDiff,
        lines: processedLineDiff,
        sentences: sentenceDiff.map(part => ({
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          value: part.value,
          count: part.count || 0
        }))
      }
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'failed to compare texts', 
      detail: String(e?.message || e) 
    }, { status: 500 });
  }
}