# L'oeil — MVP

Veille géopolitique : collecte automatisée (UCDP, GDELT, ReliefWeb, World Bank), API Cloudflare Workers, dashboard cartographique React.

## Mise en place

1. `npm install` à la racine.
2. Créer la base D1 :
   ```
   wrangler d1 create loeil
   wrangler d1 execute loeil --file=scripts/db/schema.sql
   ```
   Copier l'ID de base retourné dans `worker/wrangler.toml`.
3. Copier `scripts/collect/.dev.vars.example` vers `.env` et remplir les variables Cloudflare (Account ID, Database ID, API Token avec droits D1 Edit).
4. Renseigner les secrets GitHub Actions : `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN`, `UCDP_TOKEN` (facultatif).

## Développement local

- Collecte : `npm run collect`
- Worker : `npm run worker:dev` (sur http://localhost:8787)
- Frontend : `npm run frontend:dev`, avec `VITE_API_BASE_URL` pointant vers le Worker

## Déploiement

Le push sur `main` déclenche `deploy.yml` : déploiement du Worker puis du frontend sur Cloudflare Pages. La collecte tourne seule toutes les 6h via `collect.yml`.

## Sources actives (phase 1)

UCDP, GDELT, ReliefWeb, World Bank. ACLED, COFACE, SIPRI, CrisisWatch et les sources de la phase 2 (V-Dem, WFP, IOM, EM-DAT, OpenSanctions, etc.) restent à brancher une fois leur accès validé — voir `loeil-cahier-des-charges-v2.md`.
