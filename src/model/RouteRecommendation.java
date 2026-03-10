package model;

/**
 * Holds cost analysis for a route recommendation.
 */
public class RouteRecommendation {
    private static final double FUEL_CONSUMPTION_KM_PER_LITRE = 8.0;
    private static final double FUEL_PRICE_PER_LITRE = 11.95;
    private static final double TIME_COST_PER_MINUTE = 0.5;

    private final PathResult path;
    private final double distanceCost;
    private final double timeCost;
    private final double totalCost;

    public RouteRecommendation(PathResult path) {
        this.path = path;
        this.distanceCost = (path.getTotalDistance() / FUEL_CONSUMPTION_KM_PER_LITRE) * FUEL_PRICE_PER_LITRE;
        this.timeCost = path.getTotalTime() * TIME_COST_PER_MINUTE;
        this.totalCost = distanceCost + timeCost;
    }

    public PathResult getPath() { return path; }
    public double getDistanceCost() { return distanceCost; }
    public double getTimeCost() { return timeCost; }
    public double getTotalCost() { return totalCost; }

    @Override
    public String toString() {
        return String.format(
            "  Path     : %s%n" +
            "  Distance : %d km | Time: %d min%n" +
            "  Fuel Cost: GHS %.2f | Time Cost: GHS %.2f | Total: GHS %.2f",
            path.getPathString(), path.getTotalDistance(), path.getTotalTime(),
            distanceCost, timeCost, totalCost);
    }
}
