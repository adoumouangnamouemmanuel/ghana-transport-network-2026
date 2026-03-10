package algorithm;

import graph.TransportGraph;
import model.Edge;

import java.util.List;

/**
 * Package-private helper that removes a single directed edge from the graph.
 * Needed by Yen's algorithm which must temporarily suppress individual edges.
 */
class EdgeRemover {

    static void removeDirected(TransportGraph graph, String source, String destination) {
        List<Edge> edges = graph.getNeighbors(graph.canonical(source));
        // getNeighbors returns an unmodifiable view; we need to mutate through the graph's internal list.
        // TransportGraph.getNeighbors returns the raw list for internal package use,
        // but since they are in different packages we use the public removeEdge then re-add the reverse.
        // Workaround: use updateEdge-style approach by calling addDirectedEdge with a sentinel,
        // then rely on the package-visible adjacencyList via a friend method.

        // Simpler: just call graph.removeEdge which removes both directions, then add back the reverse direction.
        // We reconstruct the reverse edge data first.
        int dist = -1, time = -1;
        for (Edge e : graph.getNeighbors(graph.canonical(destination))) {
            if (e.getDestination().equalsIgnoreCase(graph.canonical(source))) {
                dist = e.getDistanceKm();
                time = e.getTravelTimeMinutes();
                break;
            }
        }
        graph.removeEdge(graph.canonical(source), graph.canonical(destination));
        // Restore the reverse edge if it existed
        if (dist >= 0) {
            graph.addDirectedEdge(graph.canonical(destination), graph.canonical(source), dist, time);
        }
    }
}
