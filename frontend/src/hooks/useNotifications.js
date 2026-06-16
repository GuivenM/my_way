import { useEffect, useRef } from 'react'

/**
 * useNotifications(blocks)
 * - Demande la permission au premier appel
 * - Vérifie toutes les minutes si un bloc commence dans les 5 prochaines minutes
 * - Envoie une notification une seule fois par bloc par jour
 */
export function useNotifications(blocks = []) {
  const notifiedToday = useRef(new Set()) // block_ids déjà notifiés aujourd'hui

  // Demander la permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Réinitialiser les notifications notifiées à minuit
  useEffect(() => {
    const now     = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now
    const reset = setTimeout(() => { notifiedToday.current = new Set() }, msUntilMidnight)
    return () => clearTimeout(reset)
  }, [])

  // Timer principal
  useEffect(() => {
    if (!blocks.length) return
    if (!('Notification' in window)) return

    const check = () => {
      if (Notification.permission !== 'granted') return

      const now     = new Date()
      const nowTime = now.getHours() * 60 + now.getMinutes()

      blocks.forEach(block => {
        const blockId = block.block_id ?? block.id
        if (notifiedToday.current.has(blockId)) return

        const [h, m] = (block.time_start || '00:00').split(':').map(Number)
        const blockTime = h * 60 + m
        const diff = blockTime - nowTime

        // Notifier si le bloc commence dans 0 à 5 minutes
        if (diff >= 0 && diff <= 5) {
          new Notification(`⏰ ${block.name}`, {
            body: `${block.time_start?.slice(0, 5)} – ${block.time_end?.slice(0, 5)}`,
            icon: '/favicon.ico',
            tag:  `block-${blockId}`, // évite les doublons navigateur
          })
          notifiedToday.current.add(blockId)
        }
      })
    }

    check() // vérifier immédiatement au montage
    const interval = setInterval(check, 60_000) // puis toutes les minutes
    return () => clearInterval(interval)
  }, [blocks])
}
