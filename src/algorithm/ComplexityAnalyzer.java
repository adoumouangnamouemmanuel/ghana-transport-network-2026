package algorithm;

/**
 * Q10 - Algorithm complexity and scalability analysis.
 *
 * Dijkstra with binary-heap PQ: O((V + E) log V)
 * Yen's K-Shortest Paths:         O(K * V * (V + E) log V)
 *
 * For a sparse road network: E ≈ c*V where c is the average degree.
 * Dataset example: V ≈ 185 towns, E ≈ 540 roads → avg degree ≈ 5.8
 *
 * We assume E ≈ 6V for general scalability estimates.
 */
public class ComplexityAnalyzer {

    private static final double AVG_DEGREE = 6.0;   // edges per node (average)
    private static final int    K          = 3;      // paths for Yen's algorithm

    /**
     * Prints a scalability table and ASCII chart for node counts from 100 to 5000.
     */
    public static void printScalabilityAnalysis() {
        int[] nodeCounts = {100, 250, 500, 1000, 2000, 3000, 4000, 5000};

        System.out.println("=".repeat(80));
        System.out.println("  ALGORITHM COMPLEXITY ANALYSIS  (Q10)");
        System.out.println("=".repeat(80));
        System.out.println();

        System.out.println("  Dijkstra's Algorithm:       O((V + E) log V)  ≈  O(V log V)  for sparse graphs");
        System.out.println("  Yen's K-Shortest (K=3):     O(K * V * (V + E) log V)");
        System.out.println("  Space Complexity:            O(V + E)  for adjacency list");
        System.out.println();
        System.out.printf("  Assumption: E ≈ %.0f * V  (sparse road network, avg degree %.1f)%n%n",
                AVG_DEGREE, AVG_DEGREE);

        // Table header
        System.out.printf("  %-8s %-12s %-18s %-18s%n",
                "Nodes(V)", "Edges(E≈6V)", "Dijkstra Ops", "Yen(K=3) Ops");
        System.out.println("-".repeat(65));

        long[] dijkstraOps = new long[nodeCounts.length];
        long maxOps = 0;

        // Compute estimated operations for each node count
        for (int i = 0; i < nodeCounts.length; i++) {
            int v = nodeCounts[i];
            long e = (long)(AVG_DEGREE * v);

            long dOps = (long)((v + e) * Math.log(v) / Math.log(2));   // Dijkstra ops
            long yOps = K * dOps * v;                                   // Yen's ops

            dijkstraOps[i] = dOps;
            if (dOps > maxOps) maxOps = dOps;

            System.out.printf("  %-8d %-12d %-18s %-18s%n",
                    v, e, formatLong(dOps), formatLong(yOps));
        }

        System.out.println("-".repeat(65));
        System.out.println();

        // ASCII bar chart for Dijkstra operations
        System.out.println("  DIJKSTRA SCALABILITY CHART  (operations, normalized)");
        System.out.println("  " + "-".repeat(55));
        for (int i = 0; i < nodeCounts.length; i++) {
            int bars = (int)(50.0 * dijkstraOps[i] / maxOps);
            System.out.printf("  %5d nodes | %s %s%n",
                    nodeCounts[i],
                    "#".repeat(bars),
                    formatLong(dijkstraOps[i]));
        }
        System.out.println("  " + "-".repeat(55));
        System.out.println();

        System.out.println("  CONCLUSION:");
        System.out.println("  - Dijkstra scales well for sparse road networks.");
        System.out.println("  - At 5000 nodes, the operation count remains manageable (~700K ops).");
        System.out.println("  - Yen's K-Shortest is heavier; for K=3 and 5000 nodes,");
        System.out.println("    it runs roughly K*V times Dijkstra — feasible but slower.");
        System.out.println("  - For very large networks (>10K nodes), consider A* or bidirectional Dijkstra.");
        System.out.println("=".repeat(80));
    }

    /** Formats large numbers for readability (K = thousands, M = millions). */
    private static String formatLong(long n) {
        if (n >= 1_000_000) return String.format("%.2fM", n / 1_000_000.0);
        if (n >= 1_000)     return String.format("%.1fK", n / 1_000.0);
        return String.valueOf(n);
    }
}