package model;

/**
 * Represents a directed road between two towns.
 */
public class Edge {
    private final String destination;
    private final int distanceKm;
    private final int travelTimeMinutes;

    public Edge(String destination, int distanceKm, int travelTimeMinutes) {
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.travelTimeMinutes = travelTimeMinutes;
    }

    public String getDestination() { return destination; }
    public int getDistanceKm() { return distanceKm; }
    public int getTravelTimeMinutes() { return travelTimeMinutes; }

    @Override
    public String toString() {
        return String.format("-> %s [%d km, %d min]", destination, distanceKm, travelTimeMinutes);
    }
}
