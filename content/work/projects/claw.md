---
title: CLAW — C++ Linear Algebra Library
desc: A from-scratch C++ matrix library implementing LU decomposition, RREF, inverse, rank/nullity, and sanitization of floating-point edge cases — built for numerical computing without external dependencies.
tags: [{"label":"Linear Algebra","color":"purple"},{"label":"C++","color":"green"},{"label":"Numerical Computing","color":"green"}]
image: https://opengraph.githubassets.com/1/IndraNeelMulakaloori/LA
github: https://github.com/IndraNeelMulakaloori/LA
---

## overview

**CLAW** (C++ Linear Algebra library, pronounced like "claw") is a header-based numerical computing library built from scratch in C++. It implements the core matrix operations needed for scientific computing — from basic CRUD to LU decomposition with partial pivoting — without any external dependencies like Eigen or BLAS.

## operations

- **Matrix CRUD** — create, read, update, delete elements with a clean API
- **Identity, zero, one matrices** — standard constructors
- **Matrix multiplication** — standard O(n³) implementation
- **Vstack / Hstack** — vertical and horizontal concatenation
- **LU Decomposition** — with partial pivoting for numerical stability
- **RREF** — Reduced Row Echelon Form for solving linear systems
- **Inverse** — computed via LU decomposition
- **Rank & Nullity** — derived from RREF pivot analysis
- **Sanitization** — strips `-0`, `nan`, and `-nan` artifacts from floating-point computation

## implementation

All matrix operations are declared in `include/lalib.h` and implemented in `src/`. The library uses a 2D array-backed `Mat` data structure. LU decomposition uses partial pivoting (row swapping to maximize pivot magnitude) to avoid division by near-zero values, which is the standard approach for numerically stable Gaussian elimination.

## future work

- Gram-Schmidt orthogonalization and determinant computation
- Parallel computation via OpenMP or CUDA to optimize performance on large matrices
