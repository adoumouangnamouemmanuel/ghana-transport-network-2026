package graph;

import java.io.*;
import java.nio.file.*;

/**
 * Loads the Ghana transport dataset and builds a TransportGraph.
 * Each row must follow:
 * SourceTown,DestinationTown,DistanceKm,TravelTimeMinutes
 */
public class GraphLoader {

    public static TransportGraph load(String filePath) throws IOException {
        TransportGraph graph = new TransportGraph();
        int lineNum = 0;
        int skipped = 0;

        // open the dataset file
        try (BufferedReader br = Files.newBufferedReader(Paths.get(filePath))) {
            String line;

            // read file line by line
            while ((line = br.readLine()) != null) {
                lineNum++;
                line = line.trim();

                // ignore empty lines
                if (line.isEmpty()) continue;

                // split CSV columns
                String[] parts = line.split(",");

                // check if the row has the expected number of columns
                if (parts.length != 4) {
                    System.err.printf("[WARN] Line %d malformed, skipping: %s%n", lineNum, line);
                    skipped++;
                    continue;
                }

                try {
                    // extract and clean values
                    String source = parts[0].trim();
                    String dest   = parts[1].trim();
                    // parse distance and travel time
                    int distance  = Integer.parseInt(parts[2].trim());
                    int time      = Integer.parseInt(parts[3].trim());
                    graph.addEdge(source, dest, distance, time);
                } catch (NumberFormatException e) {
                    // handle cases where distance or time is not a valid number
                    System.err.printf("[WARN] Line %d bad numbers, skipping: %s%n", lineNum, line);
                    skipped++;
                }
            }
        }

        // print a summary of the loading process
        System.out.printf("[Loader] Read %d lines, skipped %d, loaded %d towns / %d roads.%n",
                lineNum, skipped, graph.getTownCount(), graph.getEdgeCount());
        return graph;
    }
}
