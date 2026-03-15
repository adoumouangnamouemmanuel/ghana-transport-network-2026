package api;

import algorithm.Dijkstra;
import algorithm.YenKShortest;
import graph.TransportGraph;
import model.Edge;
import model.PathResult;
import model.RouteRecommendation;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service layer wrapping the singleton TransportGraph.
 * All public methods are thread-safe for concurrent reads.
 */
@Service
public class TransportService {

    private final TransportGraph graph;

    public TransportService(TransportGraph graph) {
        this.graph = graph;
    }

    /** Returns all town names in canonical form. */
    public List<String> getAllTowns() {
        return new ArrayList<>(graph.getAllTowns());
    }

    /** Returns all direct neighbors of a town. */
    public List<Map<String, Object>> getNeighbors(String town) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Edge e : graph.getNeighbors(town)) {
            Map<String, Object> nb = new LinkedHashMap<>();
            nb.put("destination", e.getDestination());
            nb.put("distanceKm", e.getDistanceKm());
            nb.put("travelTimeMin", e.getTravelTimeMinutes());
            result.add(nb);
        }
        return result;
    }

    /** Returns all edges for graph visualization. */
    public List<Map<String, Object>> getAllEdges() {
        Set<String> seen = new HashSet<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        for (String town : graph.getAllTowns()) {
            for (Edge e : graph.getNeighbors(town)) {
                String key1 = town + "|" + e.getDestination();
                String key2 = e.getDestination() + "|" + town;
                if (!seen.contains(key1) && !seen.contains(key2)) {
                    seen.add(key1);
                    Map<String, Object> edge = new LinkedHashMap<>();
                    edge.put("source", town);
                    edge.put("target", e.getDestination());
                    edge.put("distanceKm", e.getDistanceKm());
                    edge.put("travelTimeMin", e.getTravelTimeMinutes());
                    edges.add(edge);
                }
            }
        }
        return edges;
    }

    /** Returns the shortest distance path. */
    public PathResult shortestPath(String from, String to) {
        return Dijkstra.shortestPath(graph, from, to, Dijkstra.Weight.DISTANCE);
    }

    /** Returns the fastest time path. */
    public PathResult fastestPath(String from, String to) {
        return Dijkstra.shortestPath(graph, from, to, Dijkstra.Weight.TIME);
    }

    /** Returns top-K Shortest paths with cost analysis + recommendation. */
    public Map<String, Object> top3Paths(String from, String to) {
        List<PathResult> paths = YenKShortest.kShortestPaths(graph, from, to, 3, Dijkstra.Weight.DISTANCE);
        List<Map<String, Object>> routes = new ArrayList<>();
        int bestRank = 1;
        double bestCost = Double.MAX_VALUE;

        for (int i = 0; i < paths.size(); i++) {
            PathResult pr = paths.get(i);
            RouteRecommendation rec = new RouteRecommendation(pr);
            Map<String, Object> route = new LinkedHashMap<>();
            route.put("rank", i + 1);
            route.put("path", pr.getTowns());
            route.put("totalDistance", pr.getTotalDistance());
            route.put("totalTime", pr.getTotalTime());
            route.put("distanceCost", Math.round(rec.getDistanceCost() * 100.0) / 100.0);
            route.put("timeCost", Math.round(rec.getTimeCost() * 100.0) / 100.0);
            route.put("totalCost", Math.round(rec.getTotalCost() * 100.0) / 100.0);
            routes.add(route);

            if (rec.getTotalCost() < bestCost) {
                bestCost = rec.getTotalCost();
                bestRank = i + 1;
            }
        }

        Map<String, Object> recommendation = new LinkedHashMap<>();
        recommendation.put("rank", bestRank);
        recommendation.put("reason", "Lowest total cost (fuel + time)");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("routes", routes);
        result.put("recommendation", recommendation);
        return result;
    }

    /** Returns graph stats: town count, edge count, most-connected, average degree. */
    public Map<String, Object> getStats() {
        int townCount = graph.getTownCount();
        int edgeCount = graph.getEdgeCount();
        String mostConnected = "";
        int maxDegree = 0;
        for (String town : graph.getAllTowns()) {
            int deg = graph.getNeighbors(town).size();
            if (deg > maxDegree) {
                maxDegree = deg;
                mostConnected = town;
            }
        }
        double avgDegree = townCount > 0 ? (2.0 * edgeCount) / townCount : 0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTowns", townCount);
        stats.put("totalRoads", edgeCount);
        stats.put("mostConnectedTown", mostConnected);
        stats.put("mostConnectedDegree", maxDegree);
        stats.put("averageDegree", Math.round(avgDegree * 10.0) / 10.0);
        return stats;
    }

    // ---------- Mutations ----------

    public boolean updateEdge(String source, String target, int distanceKm, int travelTimeMin) {
        return graph.updateEdge(source, target, distanceKm, travelTimeMin);
    }

    public boolean removeEdge(String source, String target) {
        return graph.removeEdge(source, target);
    }

    public void addEdge(String source, String target, int distanceKm, int travelTimeMin) {
        graph.addEdge(source, target, distanceKm, travelTimeMin);
    }

    public boolean notContainsTown(String town) {
        return !graph.containsTown(town);
    }
}
