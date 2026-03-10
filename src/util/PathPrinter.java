package util;

import model.PathResult;

import java.util.List;

/**
 * Utility for printing path results in a consistent format.
 */
public class PathPrinter {

    private static final String SEP = "=".repeat(70);
    private static final String DIV = "-".repeat(70);

    public static void printSinglePath(PathResult result, String label, String from, String to) {
        System.out.println(SEP);
        System.out.printf("  %s:  %s  -->  %s%n", label, from, to);
        System.out.println(DIV);
        if (result == null) {
            System.out.println("  No path found.");
        } else {
            System.out.printf("  Distance   : %d km%n", result.getTotalDistance());
            System.out.printf("  Travel Time: %d minutes%n", result.getTotalTime());
            System.out.printf("  Path       : %s%n", result.getPathString());
        }
        System.out.println(SEP);
    }

    public static void printTopK(List<PathResult> paths, String from, String to) {
        System.out.println(SEP);
        System.out.printf("  TOP %d SHORTEST PATHS:  %s  -->  %s%n", paths.size(), from, to);
        System.out.println(DIV);
        if (paths.isEmpty()) {
            System.out.println("  No paths found.");
        } else {
            for (int i = 0; i < paths.size(); i++) {
                PathResult p = paths.get(i);
                System.out.printf("  [%d] Distance: %d km | Time: %d min%n",
                        i + 1, p.getTotalDistance(), p.getTotalTime());
                System.out.printf("      Path: %s%n%n", p.getPathString());
            }
        }
        System.out.println(SEP);
    }
}
