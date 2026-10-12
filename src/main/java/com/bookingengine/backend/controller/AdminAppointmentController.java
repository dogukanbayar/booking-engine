package com.bookingengine.backend.controller;

import com.bookingengine.backend.dto.request.UpdateStatusRequest;
import com.bookingengine.backend.dto.response.AppointmentResponse;
import com.bookingengine.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/appointments")
@RequiredArgsConstructor
public class AdminAppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> listAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long specialistId) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getAppointments(queryDate, specialistId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request));
    }
}
