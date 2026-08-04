import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Necessario para GitHub Pages de projeto: os assets sao servidos
  // sob /devclub-concurso/, nao na raiz do dominio.
  base: '/devclub-concurso/',
  plugins: [react()],
})
