// 初学者向け：ポケモンエンカウント（遭遇）ページのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PokemonEncounterPage from './PokemonEncounterPage';

// モックナビゲーション
const モックナビゲート = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => モックナビゲート,
    useParams: () => ({ speciesId: '25' }), // ピカチュウをデフォルトに
  };
});

// APIサービスのモック
const モックAPIサービス = {
  全種族データ取得: vi.fn(),
  ポケモン捕獲: vi.fn(),
};

vi.mock('../services/pokemonApi', () => ({
  ポケモンAPIサービス: vi.fn(() => モックAPIサービス),
}));

describe('PokemonEncounterPage（ポケモンエンカウントページ）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示テスト', () => {
    it('野生のポケモンが表示される', async () => {
      // 初学者向け：マスタデータのモック設定
      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('野生のピカチュウが現れた！')).toBeInTheDocument();
      });
    });

    it('ポケモンのスプライトが表示される', async () => {
      // 初学者向け：画像表示のテスト
      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const 画像 = screen.getByAltText('野生のピカチュウ');
        expect(画像).toBeInTheDocument();
        expect(画像).toHaveAttribute('src', '/sprites/pikachu.png');
      });
    });

    it('捕獲ボタンと逃げるボタンが表示される', async () => {
      // 初学者向け：アクションボタンの表示確認
      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '逃げる' })).toBeInTheDocument();
      });
    });
  });

  describe('捕獲フローテスト', () => {
    beforeEach(() => {
      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);
    });

    it('捕まえるボタンをクリックすると捕獲フォームが表示される', async () => {
      // 初学者向け：捕獲フォームの表示テスト
      const ユーザー = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
      });

      await ユーザー.click(screen.getByRole('button', { name: '捕まえる' }));

      expect(screen.getByLabelText('レベル')).toBeInTheDocument();
      expect(screen.getByLabelText('ニックネーム（任意）')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ボールを投げる' })).toBeInTheDocument();
    });

    it('レベルを入力して捕獲できる', async () => {
      // 初学者向け：捕獲成功のテスト
      const ユーザー = userEvent.setup();

      モックAPIサービス.ポケモン捕獲.mockResolvedValue({
        pokemon_id: 'test-pokemon-001',
        species_id: 25,
        level: 15,
        nickname: null,
        species: {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      });

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // 捕まえるボタンをクリック
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByRole('button', { name: '捕まえる' }));

      // レベルを入力
      const レベル入力 = screen.getByLabelText('レベル');
      await ユーザー.click(レベル入力);
      await ユーザー.clear(レベル入力);
      await ユーザー.type(レベル入力, '15');

      // ボールを投げる
      await ユーザー.click(screen.getByRole('button', { name: 'ボールを投げる' }));

      // 成功メッセージ確認
      await waitFor(() => {
        expect(screen.getByText('やったー！ピカチュウを捕まえた！')).toBeInTheDocument();
      });

      // API呼び出し確認
      expect(モックAPIサービス.ポケモン捕獲).toHaveBeenCalledWith('test-player-001', {
        species_id: 25,
        level: 15,
        nickname: undefined,
      });
    });

    it('ニックネームを付けて捕獲できる', async () => {
      // 初学者向け：ニックネーム付き捕獲のテスト
      const ユーザー = userEvent.setup();

      モックAPIサービス.ポケモン捕獲.mockResolvedValue({
        pokemon_id: 'test-pokemon-002',
        species_id: 25,
        level: 20,
        nickname: 'ピカピカ',
        species: {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      });

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // 捕獲フォームを開く
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByRole('button', { name: '捕まえる' }));

      // レベルとニックネームを入力
      const レベル入力 = screen.getByLabelText('レベル');
      await ユーザー.click(レベル入力);
      await ユーザー.clear(レベル入力);
      await ユーザー.type(レベル入力, '20');
      await ユーザー.type(screen.getByLabelText('ニックネーム（任意）'), 'ピカピカ');

      // ボールを投げる
      await ユーザー.click(screen.getByRole('button', { name: 'ボールを投げる' }));

      // 成功確認
      await waitFor(() => {
        expect(screen.getByText('やったー！ピカピカを捕まえた！')).toBeInTheDocument();
      });
    });

    it('逃げるボタンで前のページに戻る', async () => {
      // 初学者向け：逃走テスト
      const ユーザー = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '逃げる' })).toBeInTheDocument();
      });

      await ユーザー.click(screen.getByRole('button', { name: '逃げる' }));

      expect(モックナビゲート).toHaveBeenCalledWith(-1);
    });
  });

  describe('エラーハンドリングテスト', () => {
    it('無効なレベルでエラーが表示される', async () => {
      // 初学者向け：バリデーションエラーのテスト
      const ユーザー = userEvent.setup();

      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // 捕獲フォームを開く
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByRole('button', { name: '捕まえる' }));

      // 無効なレベルを入力
      const レベル入力 = screen.getByLabelText('レベル');
      await ユーザー.clear(レベル入力);
      await ユーザー.type(レベル入力, '150'); // 最大レベル100を超える

      // ボールを投げる
      await ユーザー.click(screen.getByRole('button', { name: 'ボールを投げる' }));

      // エラーメッセージ確認
      expect(screen.getByText('レベルは1〜100の範囲で入力してください')).toBeInTheDocument();
    });

    it('API エラー時にエラーメッセージが表示される', async () => {
      // 初学者向け：APIエラーハンドリングのテスト
      const ユーザー = userEvent.setup();

      モックAPIサービス.全種族データ取得.mockResolvedValue([
        {
          species_id: 25,
          name: 'ピカチュウ',
          hp: 35,
          attack: 55,
          defense: 40,
          sprite_url: '/sprites/pikachu.png',
        },
      ]);

      モックAPIサービス.ポケモン捕獲.mockRejectedValue(new Error('ネットワークエラー'));

      render(
        <MemoryRouter initialEntries={['/pokemon/encounter/25']}>
          <Routes>
            <Route path="/pokemon/encounter/:speciesId" element={<PokemonEncounterPage />} />
          </Routes>
        </MemoryRouter>
      );

      // 捕獲を試みる
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '捕まえる' })).toBeInTheDocument();
      });
      await ユーザー.click(screen.getByRole('button', { name: '捕まえる' }));
      await ユーザー.type(screen.getByLabelText('レベル'), '15');
      await ユーザー.click(screen.getByRole('button', { name: 'ボールを投げる' }));

      // エラーメッセージ確認
      await waitFor(() => {
        expect(
          screen.getByText('捕獲に失敗しました。もう一度お試しください。')
        ).toBeInTheDocument();
      });
    });
  });
});
