package com.bookingengine.backend.dto.response;

import com.bookingengine.backend.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long specialistId;
    private String specialistFullName;
    private String specialistTitle;
    private String customerFullName;
    private String customerEmail;
    private String customerPhone;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
}
