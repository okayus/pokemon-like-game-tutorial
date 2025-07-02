// 初学者向け：対話システムフックのテストファイル
// useDialogSystemの動作をテストして品質を保証します

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialogSystem } from './useDialogSystem';

// 対話データのモック
const モック対話データ = {
  id: "テスト対話",
  開始メッセージ: "挨拶",
  メッセージ: {
    "挨拶": {
      id: "挨拶",
      タイプ: "normal" as const,
      テキスト: "こんにちは！",
      次のメッセージ: "質問"
    },
    "質問": {
      id: "質問",
      タイプ: "choice" as const,
      テキスト: "何かお手伝いできますか？",
      選択肢: [
        {
          id: "はい",
          テキスト: "はい、お願いします",
          次のメッセージ: "お礼"
        },
        {
          id: "いいえ",
          テキスト: "いえ、大丈夫です",
          次のメッセージ: "終了"
        }
      ]
    },
    "お礼": {
      id: "お礼",
      タイプ: "normal" as const,
      テキスト: "ありがとうございます！"
    },
    "終了": {
      id: "終了",
      タイプ: "normal" as const,
      テキスト: "それでは、また！"
    }
  }
};

// 対話データ取得関数のモック
vi.mock('@pokemon-like-game-tutorial/shared', async () => {
  const actual = await vi.importActual('@pokemon-like-game-tutorial/shared');
  return {
    ...actual,
    対話データ取得: vi.fn(() => モック対話データ)
  };
});

describe('useDialogSystem', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('対話中ではない状態で初期化される', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      expect(result.current.対話状態.対話中).toBe(false);
      expect(result.current.現在のメッセージ).toBeUndefined();
      expect(result.current.現在のNPC名).toBeUndefined();
    });
  });

  describe('対話開始', () => {
    it('対話開始で正しく状態が更新される', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      expect(result.current.対話状態.対話中).toBe(true);
      expect(result.current.対話状態.現在のNPC).toBe('NPC1');
      expect(result.current.対話状態.現在のメッセージ).toBe('挨拶');
      expect(result.current.現在のNPC名).toBe('テストNPC');
      expect(result.current.現在のメッセージ?.テキスト).toBe('こんにちは！');
    });
  });

  describe('対話終了', () => {
    it('対話終了で状態がリセットされる', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      // まず対話を開始
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      // 対話を終了
      act(() => {
        result.current.対話終了();
      });

      expect(result.current.対話状態.対話中).toBe(false);
      expect(result.current.現在のメッセージ).toBeUndefined();
      expect(result.current.現在のNPC名).toBeUndefined();
    });
  });

  describe('メッセージ進行', () => {
    it('次のメッセージに正しく進む', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      // 対話を開始
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      // 次のメッセージに進む
      act(() => {
        result.current.次のメッセージへ();
      });

      expect(result.current.対話状態.現在のメッセージ).toBe('質問');
      expect(result.current.現在のメッセージ?.テキスト).toBe('何かお手伝いできますか？');
    });

    it('次のメッセージがない場合は対話終了する', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      // 対話を開始し、最後のメッセージまで進む
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      act(() => {
        result.current.次のメッセージへ();
      });

      act(() => {
        result.current.選択肢を選択(モック対話データ.メッセージ.質問.選択肢![0]);
      });

      // お礼メッセージに到達（次のメッセージなし）
      act(() => {
        result.current.次のメッセージへ();
      });

      expect(result.current.対話状態.対話中).toBe(false);
    });
  });

  describe('選択肢選択', () => {
    it('選択肢を選んで正しく次のメッセージに進む', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      // 対話を開始し、選択肢のあるメッセージまで進む
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      act(() => {
        result.current.次のメッセージへ();
      });

      // 最初の選択肢を選ぶ
      const 選択肢 = モック対話データ.メッセージ.質問.選択肢![0];
      act(() => {
        result.current.選択肢を選択(選択肢);
      });

      expect(result.current.対話状態.現在のメッセージ).toBe('お礼');
      expect(result.current.現在のメッセージ?.テキスト).toBe('ありがとうございます！');
    });

    it('2番目の選択肢を選んで正しく次のメッセージに進む', () => {
      const { result } = renderHook(() => useDialogSystem());
      
      // 対話を開始し、選択肢のあるメッセージまで進む
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', 'テスト対話');
      });

      act(() => {
        result.current.次のメッセージへ();
      });

      // 2番目の選択肢を選ぶ
      const 選択肢 = モック対話データ.メッセージ.質問.選択肢![1];
      act(() => {
        result.current.選択肢を選択(選択肢);
      });

      expect(result.current.対話状態.現在のメッセージ).toBe('終了');
      expect(result.current.現在のメッセージ?.テキスト).toBe('それでは、また！');
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しない対話データIDで対話開始した場合はエラーログが出力される', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // モックを存在しないデータを返すように変更  
      const sharedModule = await import('@pokemon-like-game-tutorial/shared');
      const { 対話データ取得 } = sharedModule;
      (対話データ取得 as ReturnType<typeof vi.fn>).mockReturnValueOnce(undefined);

      const { result } = renderHook(() => useDialogSystem());
      
      act(() => {
        result.current.対話開始('NPC1', 'テストNPC', '存在しない対話');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('対話データが見つかりません: 存在しない対話');
      expect(result.current.対話状態.対話中).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });
});