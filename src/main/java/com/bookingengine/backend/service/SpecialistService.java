package com.bookingengine.backend.service;

import com.bookingengine.backend.dto.response.SpecialistResponse;
import com.bookingengine.backend.entity.Specialist;
import com.bookingengine.backend.exception.ResourceNotFoundException;
import com.bookingengine.backend.repository.AppointmentRepository;
import com.bookingengine.backend.repository.SpecialistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialistService {

    private final SpecialistRepository specialistRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public List<SpecialistResponse> getAllActiveSpecialists() {
        return specialistRepository.findByIsActiveTrue().stream()
                .map(s -> SpecialistResponse.builder()
                        .id(s.getId())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .title(s.getTitle())
                        .email(s.getEmail())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LocalTime> getAvailableSlots(Long specialistId, LocalDate date) {
        if (!specialistRepository.existsById(specialistId)) {
            throw new ResourceNotFoundException("Uzman bulunamadı. ID: " + specialistId);
        }

        // 09:00 ile 17:00 arası 30 dakikalık periyotlar (Son slot 16:30)
        List<LocalTime> allDaySlots = new ArrayList<>();
        LocalTime current = LocalTime.of(9, 0);
        LocalTime dayEnd = LocalTime.of(17, 0);

        while (current.isBefore(dayEnd)) {
            allDaySlots.add(current);
            current = current.plusMinutes(30);
        }

        List<LocalTime> bookedSlots = appointmentRepository.findBookedTimesBySpecialistAndDate(specialistId, date);
        allDaySlots.removeAll(bookedSlots);

        return allDaySlots;
    }
}
