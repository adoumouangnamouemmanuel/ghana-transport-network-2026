package algorithm;

import graph.TransportGraph;
import model.Edge;
import model.PathResult;

import java.util.*;

/**
 * Standard Dijkstra's algorithm over the TransportGraph.
 * Weight selector allows switching between distance and travel time.
 */
public class Dijkstra {

    public enum Weight { DISTANCE, TIME }

    /**
     * Finds the shortest path from source to destination using the chosen weight.
     *
     * @return PathResult or null if no path exists.
     */
    public static PathResult shortestPath(TransportGraph graph, String source, String destination, Weight weight) {
        String src = source.trim().toLowerCase();
        String dst = destination.trim().toLowerCase();

        if (!graph.containsTown(source) || !graph.containsTown(destination)) return null;

        // dist map  (using lower-case keys)
        Map<String, Integer> dist = new HashMap<>();
        Map<String, String>  prev = new HashMap<>();

        // priority queue: [cost, townKey]
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        // parallel string queue for town names
        PriorityQueue<Object[]> queue = new PriorityQueue<>(Comparator.comparingInt(a -> (int) a[0]));

        // Use a combined PQ entry: (cost, townKey)
        Map<String, Integer> costMap = new HashMap<>();
        for (String t : graph.getAllTowns()) costMap.put(t.toLowerCase(), Integer.MAX_VALUE);
        costMap.put(src, 0);

        // PQ stores [cost, townKey (lowercase)]
        TreeMap<Integer, List<String>> bfsQueue = null; // not used – just use PQ below

        // Standard Dijkstra with PQ of (cost, key)
        PriorityQueue<long[]> pqMain = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        Map<String, Long> bestCost = new HashMap<>();
        pqMain.offer(new long[]{0, src.hashCode()}); // can't put strings easily; use separate map

        // Cleaner implementation using Object PQ
        record Entry(long cost, String key) implements Comparable<Entry> {
            public int compareTo(Entry o) { return Long.compare(this.cost, o.cost); }
        }

        PriorityQueue<Entry> open = new PriorityQueue<>();
        Map<String, Long> visited = new HashMap<>();
        Map<String, String> parent = new HashMap<>();

        open.offer(new Entry(0, src));
        visited.put(src, 0L);

        while (!open.isEmpty()) {
            Entry curr = open.poll();
            if (curr.cost > visited.getOrDefault(curr.key, Long.MAX_VALUE)) continue;
            if (curr.key.equals(dst)) break;

            for (Edge edge : graph.getNeighbors(graph.canonical(curr.key))) {
                String nbrKey = edge.getDestination().toLowerCase();
                long w = (weight == Weight.DISTANCE) ? edge.getDistanceKm() : edge.getTravelTimeMinutes();
                long newCost = curr.cost + w;

                if (newCost < visited.getOrDefault(nbrKey, Long.MAX_VALUE)) {
                    visited.put(nbrKey, newCost);
                    parent.put(nbrKey, curr.key);
                    open.offer(new Entry(newCost, nbrKey));
                }
            }
        }

        if (!visited.containsKey(dst)) return null;

        // Reconstruct path
        List<String> path = new ArrayList<>();
        String cur = dst;
        while (cur != null) {
            path.add(graph.canonical(cur));
            cur = parent.get(cur);
        }
        Collections.reverse(path);

        // Calculate both distance and time for the path
        int totalDist = 0, totalTime = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            String from = path.get(i);
            String to   = path.get(i + 1);
            for (Edge e : graph.getNeighbors(from)) {
                if (e.getDestination().equalsIgnoreCase(to)) {
                    totalDist += e.getDistanceKm();
                    totalTime += e.getTravelTimeMinutes();
                    break;
                }
            }
        }
        return new PathResult(path, totalDist, totalTime);
    }
}
