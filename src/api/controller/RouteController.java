package api.controller;

import api.TransportService;
import model.PathResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Handles route-finding endpoints.
 */
@RestController
@RequestMapping("/api/route")
public class RouteController {

    private final TransportService service;

    public RouteController(TransportService service) {
        this.service = service;
    }

    /** GET /api/route/shortest?from=X&to=Y */
    @GetMapping("/shortest")
    public ResponseEntity<?> shortest(
            @RequestParam String from,
            @RequestParam String to) {
        return buildSingleRoute(service.shortestPath(from, to), from, to);
    }

    /** GET /api/route/fastest?from=X&to=Y */
    @GetMapping("/fastest")
    public ResponseEntity<?> fastest(
            @RequestParam String from,
            @RequestParam String to) {
        return buildSingleRoute(service.fastestPath(from, to), from, to);
    }

    /** GET /api/route/top3?from=X&to=Y */
    @GetMapping("/top3")
    public ResponseEntity<?> top3(
            @RequestParam String from,
            @RequestParam String to) {
        if (service.notContainsTown(from) || service.notContainsTown(to)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown town: " + from + " or " + to));
        }
        Map<String, Object> result = service.top3Paths(from, to);
        if (result == null) {
            return ResponseEntity.ok(Map.of("routes", List.of(), "recommendation", null));
        }
        return ResponseEntity.ok(result);
    }

    private ResponseEntity<?> buildSingleRoute(PathResult pr, String from, String to) {
        if (service.notContainsTown(from) || service.notContainsTown(to)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown town: " + from + " or " + to));
        }
        if (pr == null) {
            return ResponseEntity.ok(Map.of("error", "No path found between " + from + " and " + to));
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("path", pr.getTowns());
        resp.put("totalDistance", pr.getTotalDistance());
        resp.put("totalTime", pr.getTotalTime());
        return ResponseEntity.ok(resp);
    }
}
