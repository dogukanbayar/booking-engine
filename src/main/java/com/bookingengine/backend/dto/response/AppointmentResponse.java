package com.bookingengine.backend.dto.response;

import com.bookingengine.backend.enums.AppointmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
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
}
