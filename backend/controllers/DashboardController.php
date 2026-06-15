<?php

declare(strict_types=1);

namespace Controllers;

use Config\Database;
use Helpers\Response;
use Middleware\Auth;

/**
 * GET /api/dashboard
 * Retourne un snapshot complet du jour en un seul appel.
 *
 * Réponse :
 * {
 *   date, greeting,
 *   vision,
 *   streak,
 *   blocks_done, blocks_total, blocks: [...],
 *   active_block: {...} | null,
 *   projects_count, projects: [...],
 *   books_count,
 *   health: { sleep_ok, exercise_ok, food_ok },
 *   quote: { text, source } | null
 * }
 */
class DashboardController
{
    public function dispatch(string $method, ?int $id, ?string $action, array $body): void
    {
        $user = Auth::check();

        match (true) {
            $method === 'GET' && !$id => $this->snapshot($user),
            default => Response::error('Route dashboard inconnue.', 404),
        };
    }

    // ------------------------------------------------------------------ //
    // GET /api/dashboard
    // ------------------------------------------------------------------ //
    private function snapshot(array $user): void
    {
        $db     = Database::get();
        $uid    = $user['id'];
        $today  = date('Y-m-d');
        $nowH   = (int)date('H');

        // ── 1. Vision ─────────────────────────────────────────────────────
        $stmt = $db->prepare('SELECT vision_text FROM m_w_user_settings WHERE user_id = ? LIMIT 1');
        $stmt->execute([$uid]);
        $vision = $stmt->fetchColumn() ?: null;

        // ── 2. Blocs du jour + statuts ────────────────────────────────────
        $stmt = $db->prepare(
            'SELECT
                b.id          AS block_id,
                b.name,
                b.description,
                b.time_start,
                b.time_end,
                b.order_index,
                COALESCE(l.id, NULL)     AS log_id,
                COALESCE(l.status, "pending") AS status
             FROM m_w_daily_blocks b
             LEFT JOIN m_w_block_logs l
                    ON l.block_id = b.id AND l.log_date = ?
             WHERE b.user_id = ?
             ORDER BY b.order_index ASC'
        );
        $stmt->execute([$today, $uid]);
        $blocks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Marquer le bloc actif selon l'heure actuelle
        $activeBlock = null;
        $nowTime     = date('H:i:s');

        foreach ($blocks as &$b) {
            $isCurrent = $nowTime >= $b['time_start'] && $nowTime < $b['time_end'];
            $b['is_current'] = $isCurrent;
            if ($isCurrent) $activeBlock = $b;
        }
        unset($b);

        $blocksDone  = count(array_filter($blocks, fn($b) => $b['status'] === 'done'));
        $blocksTotal = count($blocks);

        // ── 3. Streak ─────────────────────────────────────────────────────
        $streak = $this->computeStreak($uid, $db);

        // ── 4. Projets actifs (max 5 pour le dashboard) ───────────────────
        $stmt = $db->prepare(
            'SELECT id, name, domain, status
             FROM m_w_projects
             WHERE user_id = ? AND status IN ("active", "paused")
             ORDER BY status = "active" DESC, updated_at DESC
             LIMIT 5'
        );
        $stmt->execute([$uid]);
        $projects = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Compter toutes les tâches pour une progression approximative
        foreach ($projects as &$p) {
            $s = $db->prepare(
                'SELECT
                    COUNT(*) AS total,
                    SUM(status = "done") AS done
                 FROM m_w_tasks WHERE project_id = ?'
            );
            $s->execute([$p['id']]);
            $counts = $s->fetch(\PDO::FETCH_ASSOC);
            $total  = (int)$counts['total'];
            $done   = (int)$counts['done'];
            $p['progress'] = $total > 0 ? (int)round(($done / $total) * 100) : 0;
        }
        unset($p);

        $projectsCount = (int)$db->prepare(
            'SELECT COUNT(*) FROM m_w_projects WHERE user_id = ? AND status = "active"'
        )->execute([$uid]) ? $db->query(
            "SELECT COUNT(*) FROM m_w_projects WHERE user_id = $uid AND status = 'active'"
        )->fetchColumn() : 0;

        // ── 5. Livres en cours / terminés ─────────────────────────────────
        $stmt = $db->prepare(
            'SELECT COUNT(*) FROM m_w_books WHERE user_id = ? AND status IN ("reading","done")'
        );
        $stmt->execute([$uid]);
        $booksCount = (int)$stmt->fetchColumn();

        // ── 6. Santé du jour ──────────────────────────────────────────────
        $stmt = $db->prepare(
            'SELECT sleep_ok, exercise_ok, food_ok
             FROM m_w_health_logs WHERE user_id = ? AND log_date = ? LIMIT 1'
        );
        $stmt->execute([$uid, $today]);
        $health = $stmt->fetch(\PDO::FETCH_ASSOC) ?: [
            'sleep_ok'    => 0,
            'exercise_ok' => 0,
            'food_ok'     => 0,
        ];
        // Caster en bool pour le front
        $health = array_map(fn($v) => (bool)$v, $health);

        // ── 7. Citation aléatoire depuis les livres ────────────────────────
        // ── 7. Citation ───────────────────────────────────────────────────────
        // D'abord depuis tes livres, sinon ZenQuotes
        $stmt = $db->prepare(
            'SELECT q.content AS text, b.title AS source
     FROM m_w_book_quotes q
     JOIN m_w_books b ON b.id = q.book_id
     WHERE q.user_id = ?
     ORDER BY RAND()
     LIMIT 1'
        );
        $stmt->execute([$uid]);
        $quote = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;

        // Fallback ZenQuotes si pas de citation en base
        if (!$quote) {
            try {
                $raw = @file_get_contents('https://zenquotes.io/api/random');
                if ($raw) {
                    $data = json_decode($raw, true);
                    if (!empty($data[0]['q'])) {
                        $quote = [
                            'text'   => $data[0]['q'],
                            'source' => $data[0]['a'],
                        ];
                    }
                }
            } catch (\Exception $e) {
                // silencieux
            }
        }

        // ── 8. Greeting selon l'heure ─────────────────────────────────────
        $greeting = match (true) {
            $nowH < 12  => 'Bonjour',
            $nowH < 18  => 'Bon après-midi',
            default     => 'Bonsoir',
        };

        // ── Réponse ───────────────────────────────────────────────────────
        Response::json([
            'date'          => $today,
            'greeting'      => $greeting,
            'vision'        => $vision,
            'streak'        => $streak,
            'blocks_done'   => $blocksDone,
            'blocks_total'  => $blocksTotal,
            'blocks'        => $blocks,
            'active_block'  => $activeBlock,
            'projects_count' => (int)$projectsCount,
            'projects'      => $projects,
            'books_count'   => $booksCount,
            'health'        => $health,
            'quote'         => $quote,
        ]);
    }

    // ------------------------------------------------------------------ //
    private function computeStreak(int $userId, \PDO $db): int
    {
        $stmt = $db->prepare(
            'SELECT DISTINCT l.log_date
             FROM m_w_block_logs l
             JOIN m_w_daily_blocks b ON b.id = l.block_id
             WHERE b.user_id = ? AND l.status = "done"
             ORDER BY l.log_date DESC
             LIMIT 60'
        );
        $stmt->execute([$userId]);
        $dates = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        if (!$dates) return 0;

        $streak   = 0;
        $expected = new \DateTime('today');

        foreach ($dates as $dateStr) {
            $d = new \DateTime($dateStr);
            if ($streak === 0 && $d < (clone $expected)->modify('-1 day')) break;
            if ($d->format('Y-m-d') === $expected->format('Y-m-d')) {
                $streak++;
                $expected->modify('-1 day');
            } else {
                break;
            }
        }

        return $streak;
    }
}
