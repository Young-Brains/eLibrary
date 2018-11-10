package com.youngbrains.application.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * A FavoriteBook.
 */
@Entity
@Table(name = "favorite_book")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class FavoriteBook implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @ManyToOne
    private Book book;

    @ManyToOne
    private Profile profile;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Book getBook() {
        return book;
    }

    public FavoriteBook book(Book book) {
        this.book = book;
        return this;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Profile getProfile() {
        return profile;
    }

    public FavoriteBook profile(Profile profile) {
        this.profile = profile;
        return this;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        FavoriteBook favoriteBook = (FavoriteBook) o;
        if (favoriteBook.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), favoriteBook.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "FavoriteBook{" +
            "id=" + getId() +
            "}";
    }
}
