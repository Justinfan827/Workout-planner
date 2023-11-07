.PHONY: setup
setup:
	npm i -g yarn
	npm i -g vercel
	yarn install	
	brew install supabase/tap/supabase
	vercel login
	vercel link
	vercel pull --yes --environment=preview --git-branch staging	
vercel-staging-env-vars:
	vercel pull --yes --environment=preview --git-branch staging
reset-db:
	supabase db reset
	
