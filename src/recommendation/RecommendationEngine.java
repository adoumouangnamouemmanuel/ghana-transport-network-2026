package recommendation;

import model.PathResult;
import model.RouteRecommendation;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Computes fuel cost, time cost, and recommends the best route from a list of paths.
 */
public class RecommendationEngine {

    private static final String SEP = "=".repeat(70);
    private static final String DIV = "-".repeat(70);

    /**
     * Computes and displays cost comparison for a list of candidate paths,
     * then recommends the one with the lowest total cost.
     */
    public static RouteRecommendation recommend(List<PathResult> paths, String from, String to) {
        if (paths == null || paths.isEmpty()) {
            System.out.println("  No paths available for recommendation.");
            return null;
        }

        List<RouteRecommendation> recs = new ArrayList<>();
        for (PathResult p : paths) recs.add(new RouteRecommendation(p));

        System.out.println(SEP);
        System.out.printf("  COST ANALYSIS  %s  -->  %s%n", from, to);
        System.out.println(SEP);
        System.out.printf("  Fuel consumption: 8 km/litre | Fuel price: GHS 11.95/litre%n");
        System.out.printf("  Time cost rate  : GHS 0.50/minute%n");
        System.out.println(DIV);

        for (int i = 0; i < recs.size(); i++) {
            System.out.printf("  PATH %d:%n", i + 1);
            System.out.println(recs.get(i));
            System.out.println();
        }

        RouteRecommendation best = recs.stream()
                .min(Comparator.comparingDouble(RouteRecommendation::getTotalCost))
                .orElse(recs.get(0));

        System.out.println(DIV);
        System.out.println("  RECOMMENDATION:");
        System.out.println("  The best route (lowest total cost) is:");
        System.out.printf("    %s%n", best.getPath().getPathString());
        System.out.printf("    Distance: %d km | Time: %d min | Total Cost: GHS %.2f%n",
                best.getPath().getTotalDistance(),
                best.getPath().getTotalTime(),
                best.getTotalCost());
        System.out.println("  Justification: This route minimizes the combined fuel and time cost.");
        System.out.println(SEP);

        return best;
    }
}
