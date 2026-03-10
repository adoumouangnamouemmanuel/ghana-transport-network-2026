package algorithm;

import graph.TransportGraph;
import model.Edge;
import model.PathResult;

import java.util.*;

/**
 * Yen's K-Shortest Loopless Paths algorithm.
 * Returns up to K simple (loop-free) shortest paths by the chosen weight.
 */
public class YenKShortest {

    public static List<PathResult> kShortestPaths(
            TransportGraph graph, String source, String destination,
            int k, Dijkstra.Weight weight) {

        String src = source.trim().toLowerCase();
        String dst = destination.trim().toLowerCase();

        List<List<String>> resultPaths = new ArrayList<>();
        // Candidate paths
        PriorityQueue<List<String>> candidates = new PriorityQueue<>(
                Comparator.comparingLong(p -> pathCost(graph, p, weight)));

        // Find the first shortest path
        PathResult first = Dijkstra.shortestPath(graph, source, destination, weight);
        if (first == null) return Collections.emptyList();

        List<String> firstKeys = toLowerKeys(first.getTowns());
        resultPaths.add(firstKeys);

        for (int ki = 1; ki < k; ki++) {
            List<String> prevPath = resultPaths.get(ki - 1);

            for (int i = 0; i < prevPath.size() - 1; i++) {
                String spurNode = prevPath.get(i);
                List<String> rootPath = prevPath.subList(0, i + 1);

                // Edges to temporarily remove
                Set<String> removedEdgeKeys = new HashSet<>();
                List<EdgeBackup> removedEdges = new ArrayList<>();

                // Remove edges that share the same root path in known results
                for (List<String> rPath : resultPaths) {
                    if (rPath.size() > i && rPath.subList(0, i + 1).equals(rootPath)) {
                        String edgeSrc = rPath.get(i);
                        String edgeDst = rPath.get(i + 1);
                        String key = edgeSrc + "|" + edgeDst;
                        if (!removedEdgeKeys.contains(key)) {
                            removedEdgeKeys.add(key);
                            // backup and remove
                            backupAndRemove(graph, edgeSrc, edgeDst, removedEdges);
                        }
                    }
                }

                // Remove root nodes from the graph (except the spur node)
                Set<String> removedNodes = new HashSet<>();
                List<NodeBackup> nodeBackups = new ArrayList<>();
                for (int ri = 0; ri < rootPath.size() - 1; ri++) {
                    String rn = rootPath.get(ri);
                    if (!rn.equals(spurNode)) {
                        nodeBackups.add(backupNode(graph, rn));
                        removeNode(graph, rn);
                        removedNodes.add(rn);
                    }
                }

                // Find spur path from spurNode to destination
                PathResult spurResult = Dijkstra.shortestPath(
                        graph, graph.canonical(spurNode), destination, weight);

                if (spurResult != null) {
                    List<String> totalPath = new ArrayList<>(rootPath.subList(0, rootPath.size() - 1));
                    totalPath.addAll(toLowerKeys(spurResult.getTowns()));
                    if (!resultPaths.contains(totalPath) &&
                            !containsPath(candidates, totalPath)) {
                        candidates.offer(totalPath);
                    }
                }

                // Restore removed edges
                for (EdgeBackup eb : removedEdges) {
                    graph.addDirectedEdge(eb.src, eb.dst, eb.dist, eb.time);
                }
                // Restore removed nodes
                for (NodeBackup nb : nodeBackups) {
                    restoreNode(graph, nb);
                }
            }

            if (candidates.isEmpty()) break;
            resultPaths.add(candidates.poll());
        }

        // Convert to PathResult objects
        List<PathResult> results = new ArrayList<>();
        for (List<String> path : resultPaths) {
            results.add(buildPathResult(graph, path));
        }
        return results;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private static long pathCost(TransportGraph graph, List<String> path, Dijkstra.Weight weight) {
        long cost = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            String from = path.get(i);
            String to   = path.get(i + 1);
            for (Edge e : graph.getNeighbors(graph.canonical(from))) {
                if (e.getDestination().equalsIgnoreCase(graph.canonical(to))) {
                    cost += (weight == Dijkstra.Weight.DISTANCE)
                            ? e.getDistanceKm() : e.getTravelTimeMinutes();
                    break;
                }
            }
        }
        return cost;
    }

    private static List<String> toLowerKeys(List<String> towns) {
        List<String> keys = new ArrayList<>();
        for (String t : towns) keys.add(t.toLowerCase());
        return keys;
    }

    private static boolean containsPath(PriorityQueue<List<String>> pq, List<String> path) {
        for (List<String> p : pq) if (p.equals(path)) return true;
        return false;
    }

    private static PathResult buildPathResult(TransportGraph graph, List<String> keys) {
        List<String> display = new ArrayList<>();
        for (String k : keys) display.add(graph.canonical(k));
        int totalDist = 0, totalTime = 0;
        for (int i = 0; i < display.size() - 1; i++) {
            for (Edge e : graph.getNeighbors(display.get(i))) {
                if (e.getDestination().equalsIgnoreCase(display.get(i + 1))) {
                    totalDist += e.getDistanceKm();
                    totalTime += e.getTravelTimeMinutes();
                    break;
                }
            }
        }
        return new PathResult(display, totalDist, totalTime);
    }

    // -----------------------------------------------------------------------
    // Graph mutation helpers for Yen's algorithm
    // -----------------------------------------------------------------------

    record EdgeBackup(String src, String dst, int dist, int time) {}

    static class NodeBackup {
        String node;
        List<EdgeBackup> outgoing = new ArrayList<>();
        List<EdgeBackup> incoming = new ArrayList<>();
    }

    private static void backupAndRemove(TransportGraph graph, String src, String dst,
                                        List<EdgeBackup> backups) {
        for (Edge e : graph.getNeighbors(graph.canonical(src))) {
            if (e.getDestination().equalsIgnoreCase(graph.canonical(dst))) {
                backups.add(new EdgeBackup(graph.canonical(src), graph.canonical(dst),
                        e.getDistanceKm(), e.getTravelTimeMinutes()));
                break;
            }
        }
        // remove only the directed edge src->dst
        List<model.Edge> edges = graph.getNeighbors(graph.canonical(src));
        // We need package-level access; use removeEdge (removes both dirs) then re-add reverse
        // Instead, let's directly remove one direction via a helper
        EdgeRemover.removeDirected(graph, src, dst);
    }

    private static NodeBackup backupNode(TransportGraph graph, String node) {
        NodeBackup nb = new NodeBackup();
        nb.node = graph.canonical(node);
        for (Edge e : graph.getNeighbors(nb.node)) {
            nb.outgoing.add(new EdgeBackup(nb.node, e.getDestination(),
                    e.getDistanceKm(), e.getTravelTimeMinutes()));
        }
        // find incoming edges
        for (String town : graph.getAllTowns()) {
            for (Edge e : graph.getNeighbors(town)) {
                if (e.getDestination().equalsIgnoreCase(nb.node)) {
                    nb.incoming.add(new EdgeBackup(town, nb.node,
                            e.getDistanceKm(), e.getTravelTimeMinutes()));
                }
            }
        }
        return nb;
    }

    private static void removeNode(TransportGraph graph, String node) {
        String canonical = graph.canonical(node);
        // Remove all outgoing edges
        for (Edge e : new ArrayList<>(graph.getNeighbors(canonical))) {
            EdgeRemover.removeDirected(graph, canonical, e.getDestination());
        }
        // Remove all incoming edges
        for (String town : graph.getAllTowns()) {
            EdgeRemover.removeDirected(graph, town, canonical);
        }
    }

    private static void restoreNode(TransportGraph graph, NodeBackup nb) {
        for (EdgeBackup eb : nb.outgoing) {
            graph.addDirectedEdge(eb.src, eb.dst, eb.dist, eb.time);
        }
        for (EdgeBackup eb : nb.incoming) {
            graph.addDirectedEdge(eb.src, eb.dst, eb.dist, eb.time);
        }
    }
}
