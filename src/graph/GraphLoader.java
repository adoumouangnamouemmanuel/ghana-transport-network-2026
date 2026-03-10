package graph;

import java.io.*;
import java.nio.file.*;

/**
 * Reads the Ghana transport dataset and populates a TransportGraph.
 * Expected row format: SourceTown, DestinationTown, DistanceKm, TravelTimeMinutes
 */
public class GraphLoader {

    public static TransportGraph load(String filePath) throws IOException {
        TransportGraph graph = new TransportGraph();
        int lineNum = 0;
        int skipped = 0;

        try (BufferedReader br = Files.newBufferedReader(Paths.get(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty()) continue;

                String[] parts = line.split(",");
                if (parts.length != 4) {
                    System.err.printf("[WARN] Line %d malformed, skipping: %s%n", lineNum, line);
                    skipped++;
                    continue;
                }

                try {
                    String source = parts[0].trim();
                    String dest   = parts[1].trim();
                    int distance  = Integer.parseInt(parts[2].trim());
                    int time      = Integer.parseInt(parts[3].trim());
                    graph.addEdge(source, dest, distance, time);
                } catch (NumberFormatException e) {
                    System.err.printf("[WARN] Line %d bad numbers, skipping: %s%n", lineNum, line);
                    skipped++;
                }
            }
        }

        System.out.printf("[Loader] Read %d lines, skipped %d, loaded %d towns / %d roads.%n",
                lineNum, skipped, graph.getTownCount(), graph.getEdgeCount());
        return graph;
    }
}
