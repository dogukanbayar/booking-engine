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

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
           "WHERE a.specialist.id = :specialistId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.startTime = :startTime " +
           "AND a.status != com.bookingengine.backend.enums.AppointmentStatus.CANCELLED")
    boolean existsActiveSlot(@Param("specialistId") Long specialistId,
                             @Param("appointmentDate") LocalDate appointmentDate,
                             @Param("startTime") LocalTime startTime);

    @Query("SELECT a.startTime FROM Appointment a " +
           "WHERE a.specialist.id = :specialistId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status != com.bookingengine.backend.enums.AppointmentStatus.CANCELLED")
    List<LocalTime> findBookedTimesBySpecialistAndDate(@Param("specialistId") Long specialistId,
                                                      @Param("appointmentDate") LocalDate appointmentDate);

    List<Appointment> findByAppointmentDateAndSpecialistId(LocalDate appointmentDate, Long specialistId);

    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    List<Appointment> findBySpecialistIdAndAppointmentDate(Long specialistId, LocalDate appointmentDate);
}
