# Git ワークフロー運用ルール

## 🔒 ブランチ保護設定

### mainブランチ保護ルール

**設定日**: 2025-07-02  
**対象**: mainブランチ

#### 🛡️ 適用済み保護設定

| 設定項目 | 内容 | 効果 |
|---------|------|------|
| **プルリクエスト必須** | ✅ 有効 | mainに直接プッシュ不可 |
| **レビュー必須** | ✅ 1名以上の承認 | レビューなしではマージ不可 |
| **CIステータスチェック** | ✅ "🧪 テスト実行" | CI通過必須 |
| **管理者にも適用** | ✅ 有効 | 管理者も保護ルールに従う |
| **強制プッシュ禁止** | ✅ 有効 | git push --force 禁止 |
| **ブランチ削除禁止** | ✅ 有効 | mainブランチ削除不可 |

## 📋 開発ワークフロー

### 1. 新機能・修正の開発手順

```bash
# 1. mainブランチから最新を取得
git checkout main
git pull origin main

# 2. 作業用ブランチ作成
git checkout -b feature/新機能名
# or
git checkout -b fix/修正内容

# 3. 開発・テスト・コミット
git add .
git commit -m "適切なコミットメッセージ"

# 4. リモートにプッシュ
git push origin feature/新機能名

# 5. プルリクエスト作成
gh pr create --title "タイトル" --body "説明"

# 6. レビュー・CI通過後にマージ
gh pr merge --merge
```

### 2. ブランチ命名規則

| プレフィックス | 用途 | 例 |
|---------------|------|---|
| `feature/` | 新機能追加 | `feature/user-registration` |
| `fix/` | バグ修正 | `fix/login-error` |
| `docs/` | ドキュメント更新 | `docs/api-specification` |
| `test/` | テスト追加・修正 | `test/battle-system` |
| `refactor/` | リファクタリング | `refactor/database-schema` |
| `chore/` | 雑務・設定変更 | `chore/update-dependencies` |

### 3. コミットメッセージ規則

```
<type>: <description>

[optional body]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**タイプ**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `test`: テスト
- `refactor`: リファクタリング
- `chore`: 雑務

## ⚠️ 注意事項

### ❌ 禁止事項

- mainブランチに直接プッシュ
- レビューなしでのマージ
- CI失敗状態でのマージ
- 強制プッシュ（git push --force）

### ✅ 推奨事項

- 小さな単位でコミット
- 意味のあるコミットメッセージ
- プルリクエストでの詳細な説明
- レビューでの建設的なフィードバック

## 🚨 緊急時の対応

### ホットフィックス手順

```bash
# 1. 緊急修正用ブランチ作成
git checkout -b hotfix/緊急修正内容

# 2. 最小限の修正を実施
# （テストも含める）

# 3. 緊急プルリクエスト作成
gh pr create --title "🚨 HOTFIX: 緊急修正内容" 

# 4. 迅速なレビュー・マージ
```

### 保護設定の一時解除

**管理者のみ**: GitHub Web UI > Settings > Branches で一時的に保護解除可能  
**注意**: 緊急時以外は使用禁止

## 📊 CI/CDパイプライン連携

### パイプライン実行タイミング

- **プルリクエスト作成・更新**: テストのみ実行
- **mainブランチマージ**: テスト成功後にデプロイ実行

### CIチェック項目

- TypeScript型チェック
- ESLint（コード品質）
- ユニットテスト
- E2Eテスト
- ビルド確認

## 🔄 設定変更履歴

| 日付 | 変更内容 | 理由 |
|------|----------|------|
| 2025-07-02 | ブランチ保護設定を初回適用 | 品質向上・安全な開発フロー確立 |

---

**更新日**: 2025-07-02  
**作成者**: Claude Code  
**レビュー**: 初学者向けポケモンライクゲーム開発チーム