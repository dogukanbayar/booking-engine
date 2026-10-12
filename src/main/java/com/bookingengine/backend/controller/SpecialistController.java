package com.bookingengine.backend.controller;

import com.bookingengine.backend.dto.response.SpecialistResponse;
import com.bookingengine.backend.service.SpecialistService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/specialists")
@RequiredArgsConstructor
public class SpecialistController {

    private final SpecialistService specialistService;

    @GetMapping
    public ResponseEntity<List<SpecialistResponse>> getSpecialists() {
        return ResponseEntity.ok(specialistService.getAllActiveSpecialists());
    }

    @GetMapping("/{id}/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(specialistService.getAvailableSlots(id, date));
    }
}
