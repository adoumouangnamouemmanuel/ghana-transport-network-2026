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
