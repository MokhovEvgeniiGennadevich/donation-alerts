# Push Repository to GitHub / Gitlab
git:
	git push github && git push gitlab

# Run Dev
dev:
	cd backend/parser && npm run dev

.PHONY: git dev