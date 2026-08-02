import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ScrollTrigger } from './lib/gsap' // registra os plugins do GSAP uma única vez, antes de qualquer componente
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// As fontes web podem trocar a altura de títulos/linhas depois do primeiro
// layout — sem isto, ScrollTriggers criados antes (pin da trilha, parallax,
// máscaras de título) ficariam com posições calculadas sobre uma métrica
// de fonte desatualizada.
document.fonts.ready.then(() => ScrollTrigger.refresh())
