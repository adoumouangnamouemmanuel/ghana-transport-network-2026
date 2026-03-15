package model;

import java.util.List;

/**
 * After searching a particular path from a source to a destination town
 * this holds the result of the path searched: the ordered list of towns,
 * total distance and total travel time.
 */
public class PathResult {
    private final List<String> towns;
    private final int totalDistance;
    private final int totalTime;

    public PathResult(List<String> towns, int totalDistance, int totalTime) {
        this.towns = towns;
        this.totalDistance = totalDistance;
        this.totalTime = totalTime;
    }

    // getters
    public List<String> getTowns() {
        return towns;
    }

    public int getTotalDistance() {
        return totalDistance;
    }

    public int getTotalTime() {
        return totalTime;
    }

    /**
     * convert the list of towns into a string showing the road
     * -> is used as delimiter.
     */
    public String getPathString()
    {
        return String.join(" -> ", towns);
    }

    @Override
    public String toString() {
        return "Path: " + getPathString() + "\n" +
                "Distance: " + totalDistance + " km | Time: " + totalTime + " min";
    }
}
