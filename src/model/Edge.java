package model;

/**
 * Edge in the road graph.
 * Stores destination town, distance (km) and travel time (minutes).
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

    // getters
    public String getDestination() { return destination; }
    public int getDistanceKm() { return distanceKm; }
    public int getTravelTimeMinutes() { return travelTimeMinutes; }


    @Override
    public String toString() {
        return "-> " + destination + " [" + distanceKm + " km, " + travelTimeMinutes + " min]";
    }
}
