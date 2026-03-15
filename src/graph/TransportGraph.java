package graph;

import model.Edge;

import java.util.*;

/**
 * Directed weighted graph of Ghanaian towns.
 * Uses an adjacency list keyed by town name (case-insensitive).
 * Each town maps to its list of outgoing edges (both directions stored,
 * since the spec says routes are bidirectional).
 */
public class TransportGraph {

    // key = town name (lower-cased for lookup), value = list of outgoing edges
    private final Map<String, List<Edge>> adjacencyList = new LinkedHashMap<>();

    // preserve original casing for display
    private final Map<String, String> canonicalNames = new LinkedHashMap<>();

    /**
     * Adds a directed edge
     */
    public void addDirectedEdge(String source, String destination, int distanceKm, int travelTimeMinutes) {
        String srcKey = source.trim().toLowerCase();
        String dstKey = destination.trim().toLowerCase();

        // store canonical names for nicer display later
        canonicalNames.putIfAbsent(srcKey, source.trim());
        canonicalNames.putIfAbsent(dstKey, destination.trim());

        // ensure towns exist in the adjacency list
        adjacencyList.putIfAbsent(srcKey, new ArrayList<>());
        adjacencyList.putIfAbsent(dstKey, new ArrayList<>());

        // remove existing edge to avoid duplicates
        adjacencyList.get(srcKey)
                .removeIf(e -> e.getDestination().equalsIgnoreCase(destination.trim()));

        // add the new edge
        adjacencyList.get(srcKey)
                .add(new Edge(destination.trim(), distanceKm, travelTimeMinutes));
    }

    /**
     * Adds a bidirectional edge. If the edge already exists it is replaced.
     */
    public void addEdge(String source, String destination, int distanceKm, int travelTimeMinutes) {
        // store both directions since roads are bidirectional
        addDirectedEdge(source, destination, distanceKm, travelTimeMinutes);
        addDirectedEdge(destination, source, distanceKm, travelTimeMinutes);
    }

    /**
     * Removes the bidirectional edge between two towns.
     * Returns true if at least one direction was removed.
     */
    public boolean removeEdge(String source, String destination) {
        boolean removed = false;

        String srcKey = source.trim().toLowerCase();
        String dstKey = destination.trim().toLowerCase();

        List<Edge> srcEdges = adjacencyList.get(srcKey);
        if (srcEdges != null) {
            removed |= srcEdges.removeIf(
                    e -> e.getDestination().equalsIgnoreCase(destination.trim()));
        }

        List<Edge> dstEdges = adjacencyList.get(dstKey);
        if (dstEdges != null) {
            removed |= dstEdges.removeIf(
                    e -> e.getDestination().equalsIgnoreCase(source.trim()));
        }

        return removed;
    }

    /**
     * Updates the weight of an existing bidirectional edge.
     * Returns true if the edge was found and updated.
     */
    public boolean updateEdge(String source, String destination, int newDistance, int newTime) {
        boolean updated = updateDirected(source, destination, newDistance, newTime);
        updated |= updateDirected(destination, source, newDistance, newTime);
        return updated;
    }

    private boolean updateDirected(String source, String destination, int dist, int time) {
        List<Edge> edges = adjacencyList.get(source.trim().toLowerCase());
        if (edges == null) return false;

        // search for the edge to update
        for (int i = 0; i < edges.size(); i++) {
            if (edges.get(i).getDestination().equalsIgnoreCase(destination.trim())) {
                edges.set(i, new Edge(destination.trim(), dist, time));
                return true;
            }
        }

        return false;
    }

    public List<Edge> getNeighbors(String town) {
        List<Edge> edges = adjacencyList.get(town.trim().toLowerCase());

        // return read-only view to prevent external modification
        return edges != null ? Collections.unmodifiableList(edges)
                : Collections.emptyList();
    }

    public boolean containsTown(String town) {
        return adjacencyList.containsKey(town.trim().toLowerCase());
    }

    public Set<String> getAllTowns() {
        Set<String> result = new LinkedHashSet<>();

        // return towns using their canonical display names
        for (String key : adjacencyList.keySet()) {
            result.add(canonicalNames.getOrDefault(key, key));
        }

        return result;
    }

    public int getTownCount() {
        return adjacencyList.size();
    }

    public int getEdgeCount() {
        // each undirected edge is stored as two directed edges
        int total = 0;
        for (List<Edge> edges : adjacencyList.values()) {
            total += edges.size();
        }
        return total / 2;
    }

    /** Canonical (display) name for a town. */
    public String canonical(String town) {
        return canonicalNames.getOrDefault(
                town.trim().toLowerCase(),
                town.trim());
    }
}