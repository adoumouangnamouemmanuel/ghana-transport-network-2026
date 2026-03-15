package algorithm;

import graph.TransportGraph;
import model.Edge;
import model.PathResult;

import java.util.*;

/**
 * Standard Dijkstra's algorithm for TransportGraph.
 * Can choose distance or time as edge weight.
 */
public class Dijkstra {

    public enum Weight { DISTANCE, TIME }

    /**
     * Finds the shortest path from source to destination using the chosen weight.
     * Returns null if no path exists.
     */
    public static PathResult shortestPath(TransportGraph graph, String source, String destination, Weight weight) {
        String src = source.trim().toLowerCase();
        String dst = destination.trim().toLowerCase();

        // If either town doesn't exist, return null
        if (!graph.containsTown(source) || !graph.containsTown(destination)) return null;

        // Maps for shortest distance so far and path tracking
        Map<String, Long> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();

        // Initialize distances to infinity
        for (String t : graph.getAllTowns()) dist.put(t.toLowerCase(), Long.MAX_VALUE);
        dist.put(src, 0L); // source distance = 0

        // Inner class for priority queue entries
        class Entry implements Comparable<Entry> {
            String key;   // town key (lowercase)
            long cost;    // distance/time cost
            Entry(String k, long c) { key = k; cost = c; }
            public int compareTo(Entry o) { return Long.compare(cost, o.cost); }
        }

        PriorityQueue<Entry> open = new PriorityQueue<>();
        open.offer(new Entry(src, 0L)); // start with source

        // Main Dijkstra loop
        while (!open.isEmpty()) {
            Entry curr = open.poll();

            // Stop if we reached the destination
            if (curr.key.equals(dst)) break;

            // Check all neighbors of current town
            for (Edge edge : graph.getNeighbors(graph.canonical(curr.key))) {
                String nbr = edge.getDestination().toLowerCase();
                long w = (weight == Weight.DISTANCE) ? edge.getDistanceKm() : edge.getTravelTimeMinutes();
                long newCost = curr.cost + w;

                // Update neighbor if we found a shorter path
                if (newCost < dist.getOrDefault(nbr, Long.MAX_VALUE)) {
                    dist.put(nbr, newCost);
                    prev.put(nbr, curr.key);
                    open.offer(new Entry(nbr, newCost));
                }
            }
        }

        // No path found
        if (!dist.containsKey(dst) || dist.get(dst) == Long.MAX_VALUE) return null;

        // Reconstruct the path from destination to source
        List<String> path = new ArrayList<>();
        String cur = dst;
        while (cur != null) {
            path.add(graph.canonical(cur));
            cur = prev.get(cur);
        }
        Collections.reverse(path); // path should go from source -> destination

        // Compute total distance and time along the path
        int totalDist = 0, totalTime = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            String from = path.get(i);
            String to = path.get(i + 1);
            for (Edge e : graph.getNeighbors(from)) {
                if (e.getDestination().equalsIgnoreCase(to)) {
                    totalDist += e.getDistanceKm();
                    totalTime += e.getTravelTimeMinutes();
                    break; // found the edge, no need to check others
                }
            }
        }

        // Return the final path result
        return new PathResult(path, totalDist, totalTime);
    }
}