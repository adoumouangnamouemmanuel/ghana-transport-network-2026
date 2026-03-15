package model;

/**
 * Computes the estimated costs for a route.
 * Includes fuel cost based on distance and time cost.
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

    // getters
    public PathResult getPath() {
        return path;
    }

    public double getDistanceCost() {
        return distanceCost;
    }

    public double getTimeCost() {
        return timeCost;
    }

    public double getTotalCost() {
        return totalCost;
    }

    // String representation
    @Override
    public String toString() {
        return "  Path     : " + path.getPathString() + "\n" +
                "  Distance : " + path.getTotalDistance() + " km | Time: " + path.getTotalTime() + " min\n" +
                "  Fuel Cost: GHS " + String.format("%.2f", distanceCost) +
                " | Time Cost: GHS " + String.format("%.2f", timeCost) +
                " | Total: GHS " + String.format("%.2f", totalCost);
    }
}
