package com.example.equall.controller;

import com.example.equall.service.SettlementService;
import com.example.equall.service.SettlementService.Transaction;
import com.example.equall.service.SettlementService.DetailedResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @PostMapping("/settle")
    public ResponseEntity<?> settleGroup(@PathVariable Long groupId) {
        try {
            List<Transaction> txns = settlementService.settleGroup(groupId);
            return ResponseEntity.ok(txns);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to compute settlement: " + ex.getMessage());
        }
    }

    // Debug endpoint
    @PostMapping("/settle-debug")
    public ResponseEntity<?> settleGroupDebug(@PathVariable Long groupId) {
        try {
            DetailedResult d = settlementService.settleGroupDetailed(groupId);
            return ResponseEntity.ok(d);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to compute settlement (debug): " + ex.getMessage());
        }
    }
}
