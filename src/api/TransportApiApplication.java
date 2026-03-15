package api;

import graph.GraphLoader;
import graph.TransportGraph;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import java.io.IOException;

/**
 * Spring Boot entry point for the Ghana Transport Network REST API.
 * Loads the transport graph at startup and exposes it as a singleton bean.
 */
@SpringBootApplication
@ComponentScan(basePackages = {"api"})
public class TransportApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TransportApiApplication.class, args);
    }

    @Bean
    public TransportGraph transportGraph() throws IOException {
        String dataFile = "data/ghana_cities_graph_2026.txt";
        System.out.println("[API] Loading transport graph from: " + dataFile);
        TransportGraph graph = GraphLoader.load(dataFile);
        System.out.printf("[API] Graph loaded: %d towns, %d roads%n",
                graph.getTownCount(), graph.getEdgeCount());
        return graph;
    }
}
