package com.bookingengine.backend.repository;

import com.bookingengine.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a.startTime FROM Appointment a " +
           "WHERE a.specialist.id = :specialistId " +
           "AND a.appointmentDate = :date " +
           "AND a.status <> com.bookingengine.backend.enums.AppointmentStatus.CANCELLED")
    List<LocalTime> findBookedTimesBySpecialistAndDate(
            @Param("specialistId") Long specialistId,
            @Param("date") LocalDate date
    );

    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
           "WHERE a.specialist.id = :specialistId " +
           "AND a.appointmentDate = :date " +
           "AND a.startTime = :startTime " +
           "AND a.status <> com.bookingengine.backend.enums.AppointmentStatus.CANCELLED")
    boolean existsActiveSlot(
            @Param("specialistId") Long specialistId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime
    );

    List<Appointment> findByAppointmentDateOrderByStartTimeAsc(LocalDate date);

    List<Appointment> findBySpecialistIdAndAppointmentDateOrderByStartTimeAsc(Long specialistId, LocalDate date);
}
