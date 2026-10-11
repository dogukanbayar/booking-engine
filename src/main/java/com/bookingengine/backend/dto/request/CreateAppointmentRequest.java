package com.bookingengine.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateAppointmentRequest {

    @NotNull(message = "Uzman seçimi zorunludur.")
    private Long specialistId;

    @NotBlank(message = "Müşteri adı zorunludur.")
    private String customerFirstName;

    @NotBlank(message = "Müşteri soyadı zorunludur.")
    private String customerLastName;

    @NotBlank(message = "E-posta adresi zorunludur.")
    @Email(message = "Geçerli bir e-posta formatı giriniz.")
    private String customerEmail;

    @NotBlank(message = "Telefon numarası zorunludur.")
    private String customerPhone;

    @NotNull(message = "Randevu tarihi zorunludur.")
    @FutureOrPresent(message = "Randevu tarihi geçmiş bir gün olamaz.")
    private LocalDate appointmentDate;

    @NotNull(message = "Randevu saati zorunludur.")
    private LocalTime startTime;

    private String notes;
}
