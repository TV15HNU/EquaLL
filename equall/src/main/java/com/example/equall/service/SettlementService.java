package com.example.equall.service;

import com.example.equall.model.*;
import com.example.equall.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    private final GroupRepository groupRepo;
    private final PersonRepository personRepo;
    private final EventRepository eventRepo;
    private final EventParticipantRepository participantRepo;

    public SettlementService(GroupRepository groupRepo,
                             PersonRepository personRepo,
                             EventRepository eventRepo,
                             EventParticipantRepository participantRepo) {
        this.groupRepo = groupRepo;
        this.personRepo = personRepo;
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
    }

    public static class Transaction {
        public Long fromId;
        public String fromName;
        public Long toId;
        public String toName;
        public BigDecimal amount;

        public Transaction(Long fromId, String fromName, Long toId, String toName, BigDecimal amount) {
            this.fromId = fromId;
            this.fromName = fromName;
            this.toId = toId;
            this.toName = toName;
            this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        }
    }

    /** New: detailed result returned by the debug endpoint */
    public static class PersonSummary {
        public Long personId;
        public String name;
        public BigDecimal paid;
        public BigDecimal owed;
        public BigDecimal balance;

        public PersonSummary(Long personId, String name, BigDecimal paid, BigDecimal owed, BigDecimal balance) {
            this.personId = personId;
            this.name = name;
            this.paid = paid;
            this.owed = owed;
            this.balance = balance;
        }
    }

    public static class DetailedResult {
        public List<PersonSummary> people;
        public List<Transaction> transactions;

        public DetailedResult(List<PersonSummary> people, List<Transaction> transactions) {
            this.people = people;
            this.transactions = transactions;
        }
    }

    /**
     * Original settle method (unchanged behaviour) kept for backward compatibility.
     */
    public List<Transaction> settleGroup(Long groupId) {
        DetailedResult d = settleGroupDetailed(groupId);
        return d.transactions;
    }

    /**
     * NEW: returns per-person paid/owed/balance + computed transactions
     */
    public DetailedResult settleGroupDetailed(Long groupId) {
        if (groupRepo.findById(groupId).isEmpty()) {
            throw new IllegalArgumentException("Group not found: " + groupId);
        }

        // Load people in the group
        List<Person> people = personRepo.findAll().stream()
                .filter(p -> p.getGroup() != null && Objects.equals(p.getGroup().getId(), groupId))
                .collect(Collectors.toList());

        Map<Long, BigDecimal> paid = new HashMap<>();
        Map<Long, BigDecimal> owed = new HashMap<>();
        Map<Long, String> idToName = new HashMap<>();

        for (Person p : people) {
            paid.put(p.getId(), BigDecimal.ZERO);
            owed.put(p.getId(), BigDecimal.ZERO);
            idToName.put(p.getId(), p.getName());
        }

        // Load events
        List<Event> events = eventRepo.findByGroupId(groupId);

        // Sum paid amounts
        for (Event e : events) {
            if (e.getPayer() != null && e.getAmount() != null) {
                Long payerId = e.getPayer().getId();
                BigDecimal prev = paid.getOrDefault(payerId, BigDecimal.ZERO);
                paid.put(payerId, prev.add(e.getAmount()));
                idToName.putIfAbsent(payerId, e.getPayer().getName());
            }
        }

        // Sum owed amounts (share of each participant)
        for (Event e : events) {
            BigDecimal eventAmount = e.getAmount() == null ? BigDecimal.ZERO : e.getAmount();
            List<EventParticipant> parts = participantRepo.findByEventId(e.getId());
            if (parts == null || parts.isEmpty()) continue;

            BigDecimal totalShares = parts.stream()
                    .map(p -> p.getShare() == null ? BigDecimal.ONE : p.getShare())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalShares.compareTo(BigDecimal.ZERO) == 0) {
                totalShares = BigDecimal.valueOf(parts.size());
            }

            for (EventParticipant ep : parts) {
                Long pid = ep.getPerson().getId();
                BigDecimal share = ep.getShare() == null ? BigDecimal.ONE : ep.getShare();
                BigDecimal shareAmount = BigDecimal.ZERO;
                if (eventAmount.compareTo(BigDecimal.ZERO) != 0) {
                    shareAmount = eventAmount.multiply(share)
                            .divide(totalShares, 10, RoundingMode.HALF_UP)
                            .setScale(2, RoundingMode.HALF_UP);
                }
                owed.put(pid, owed.getOrDefault(pid, BigDecimal.ZERO).add(shareAmount));
                idToName.putIfAbsent(pid, ep.getPerson().getName());
            }
        }

        // Compute balances
        Map<Long, BigDecimal> balance = new HashMap<>();
        for (Long id : idToName.keySet()) {
            BigDecimal p = paid.getOrDefault(id, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal o = owed.getOrDefault(id, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal b = p.subtract(o).setScale(2, RoundingMode.HALF_UP);
            balance.put(id, b);
        }

        // Build sorted creditors and debtors
        PriorityQueue<Map.Entry<Long, BigDecimal>> creditors = new PriorityQueue<>(
                (a, b) -> b.getValue().compareTo(a.getValue())
        );
        PriorityQueue<Map.Entry<Long, BigDecimal>> debtors = new PriorityQueue<>(
                (a, b) -> a.getValue().compareTo(b.getValue())
        );

        for (Map.Entry<Long, BigDecimal> e : balance.entrySet()) {
            if (e.getValue().compareTo(BigDecimal.ZERO) > 0) creditors.add(new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()));
            else if (e.getValue().compareTo(BigDecimal.ZERO) < 0) debtors.add(new AbstractMap.SimpleEntry<>(e.getKey(), e.getValue()));
        }

        List<Transaction> transactions = new ArrayList<>();

        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            var cr = creditors.poll();
            var db = debtors.poll();

            Long credId = cr.getKey();
            Long debtId = db.getKey();
            BigDecimal credAmt = cr.getValue();
            BigDecimal debtAmt = db.getValue().abs();

            BigDecimal transfer = credAmt.min(debtAmt).setScale(2, RoundingMode.HALF_UP);

            transactions.add(new Transaction(debtId, idToName.get(debtId),
                    credId, idToName.get(credId), transfer));

            BigDecimal newCred = credAmt.subtract(transfer).setScale(2, RoundingMode.HALF_UP);
            BigDecimal newDebt = debtAmt.subtract(transfer).setScale(2, RoundingMode.HALF_UP);

            if (newCred.compareTo(BigDecimal.ZERO) > 0) creditors.add(new AbstractMap.SimpleEntry<>(credId, newCred));
            if (newDebt.compareTo(BigDecimal.ZERO) > 0) debtors.add(new AbstractMap.SimpleEntry<>(debtId, newDebt.negate()));
        }

        // build person summaries in deterministic order
        List<PersonSummary> summaries = idToName.keySet().stream()
                .sorted()
                .map(id -> new PersonSummary(id, idToName.get(id),
                        paid.getOrDefault(id, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP),
                        owed.getOrDefault(id, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP),
                        balance.getOrDefault(id, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP)))
                .collect(Collectors.toList());

        return new DetailedResult(summaries, transactions);
    }
}
