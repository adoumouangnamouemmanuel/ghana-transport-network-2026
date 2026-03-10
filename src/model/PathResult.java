package model;

import java.util.List;

/**
 * Holds the result of a path search: the ordered list of towns,
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

    public List<String> getTowns() { return towns; }
    public int getTotalDistance() { return totalDistance; }
    public int getTotalTime() { return totalTime; }

    public String getPathString() {
        return String.join(" -> ", towns);
    }

    @Override
    public String toString() {
        return String.format("Path: %s%nDistance: %d km | Time: %d min",
                getPathString(), totalDistance, totalTime);
    }
}
