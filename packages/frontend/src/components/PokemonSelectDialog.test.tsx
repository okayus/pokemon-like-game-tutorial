// 初学者向け：ポケモン選択ダイアログのテスト
// TDDアプローチでテストを先に作成

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokemonSelectDialog } from './PokemonSelectDialog';
// 所有ポケモン型は現在未使用 - 必要に応じて後で追加

describe('PokemonSelectDialog', () => {
  const mockProps = {
    isOpen: true,
    itemName: 'きずぐすり',
    effectType: 'HP回復',
    onClose: vi.fn(),
    onSelectPokemon: vi.fn(),
    playerId: 'test-player-001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本表示', () => {
    it('ダイアログが開いている時に正しく表示される', () => {
      render(<PokemonSelectDialog {...mockProps} />);

      expect(screen.getByText('ポケモンを選択')).toBeInTheDocument();
      expect(screen.getByText('きずぐすりを使用するポケモンを選んでください')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('ダイアログが閉じている時は何も表示されない', () => {
      render(<PokemonSelectDialog {...mockProps} isOpen={false} />);

      expect(screen.queryByText('ポケモンを選択')).not.toBeInTheDocument();
    });
  });

  describe('ポケモン一覧表示', () => {
    it('モックポケモンが正しく表示される', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      // モックデータのポケモンが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('フシギダネ')).toBeInTheDocument();
      });

      expect(screen.getByText('ファイア')).toBeInTheDocument();
      expect(screen.getByText('ゼニガメ')).toBeInTheDocument();

      // HP情報が表示される
      expect(screen.getByText('15/20')).toBeInTheDocument();
      expect(screen.getByText('5/22')).toBeInTheDocument();
      expect(screen.getByText('21/21')).toBeInTheDocument();
    });

    it('HP満タンのポケモンは使用不可として表示される', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('ゼニガメ')).toBeInTheDocument();
      });

      // HP満タンのゼニガメは使用不可
      const ゼニガメカード = screen.getByText('ゼニガメ').closest('div');
      expect(ゼニガメカード).toHaveClass('opacity-50');
      expect(ゼニガメカード).toHaveClass('cursor-not-allowed');
    });

    it('HP減少したポケモンは使用可能として表示される', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('ファイア')).toBeInTheDocument();
      });

      // HP減少したファイアは使用可能
      const ファイアカード = screen.getByText('ファイア').closest('div');
      expect(ファイアカード).toHaveClass('hover:bg-slate-600');
      expect(ファイアカード).toHaveClass('cursor-pointer');
    });
  });

  describe('インタラクション', () => {
    it('使用可能なポケモンクリック時にコールバックが呼ばれる', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('ファイア')).toBeInTheDocument();
      });

      // HP減少したファイアをクリック
      const ファイアカード = screen.getByText('ファイア').closest('div');
      await userEvent.click(ファイアカード!);

      expect(mockProps.onSelectPokemon).toHaveBeenCalledWith(
        expect.objectContaining({
          pokemon_id: 'owned-2',
          species: expect.objectContaining({
            name: 'ヒトカゲ',
          }),
          nickname: 'ファイア',
        })
      );
    });

    it('使用不可なポケモンクリック時は何も起こらない', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('ゼニガメ')).toBeInTheDocument();
      });

      // HP満タンのゼニガメをクリック
      const ゼニガメカード = screen.getByText('ゼニガメ').closest('div');
      await userEvent.click(ゼニガメカード!);

      expect(mockProps.onSelectPokemon).not.toHaveBeenCalled();
    });

    it('キャンセルボタンクリック時にコールバックが呼ばれる', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      const キャンセルボタン = screen.getByText('キャンセル');
      await userEvent.click(キャンセルボタン);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('背景クリック時にダイアログが閉じる', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      // 背景オーバーレイをクリック
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/60');
      await userEvent.click(overlay!);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('閉じるボタンクリック時にダイアログが閉じる', async () => {
      render(<PokemonSelectDialog {...mockProps} />);

      const 閉じるボタン = screen.getByText('×');
      await userEvent.click(閉じるボタン);

      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('エフェクトタイプによる判定', () => {
    it('状態異常回復アイテムの場合は常に使用不可', async () => {
      render(
        <PokemonSelectDialog {...mockProps} effectType="状態異常回復" itemName="なんでもなおし" />
      );

      await waitFor(() => {
        expect(screen.getByText('フシギダネ')).toBeInTheDocument();
      });

      // 簡素版では状態異常なしのため、全て使用不可
      const ポケモンカード = screen.getAllByText('このアイテムは使用できません');
      expect(ポケモンカード.length).toBe(3);
    });

    it('全回復アイテムの場合はHP減少したポケモンで使用可能', async () => {
      render(
        <PokemonSelectDialog {...mockProps} effectType="全回復" itemName="かいふくのくすり" />
      );

      await waitFor(() => {
        expect(screen.getByText('ファイア')).toBeInTheDocument();
      });

      // HP減少したポケモンは使用可能
      const ファイアカード = screen.getByText('ファイア').closest('div');
      expect(ファイアカード).toHaveClass('hover:bg-slate-600');

      // HP満タンは使用不可
      const ゼニガメカード = screen.getByText('ゼニガメ').closest('div');
      expect(ゼニガメカード).toHaveClass('opacity-50');
    });
  });
});
