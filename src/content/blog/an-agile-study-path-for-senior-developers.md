---
title: 'An Agile study path for senior developers'
description: 'This is a learning path every developer looking to become “senior” can follow.'
pubDate: '2022-10-07'
updatedDate: '2023-03-22'
---

This is a learning path every developer looking to become “senior” can follow.

This path reflects agile culture and values, which have their roots in the [agile manifesto](http://agilemanifesto.org/), as well as in those of XP, and in the [software craftsmanship manifesto](http://manifesto.softwarecraftsmanship.org/).

This study path is not meant to teach specific languages and tech stacks: rather it reflects how to builds all sort of software according to reusable agile, clean code and design principles.

Yes, it is a lot of content. No, you don’t have to have read _all of it_ before you start your career growth to the next level. However, you should at the very least be comfortable explaining each and every topic in this list. If you are not, then that should be considered a **knowledge gap**.

This study path is adapted from a battle tested one [https://github.com/xpeppers/starway-to-orione](https://github.com/xpeppers/starway-to-orione) and is composed of basic reference literature, articles and videos for each topic. After following this, you should be able to hold your own and provide meaningful references in any conversation with your peers.

It is meant to be consumed in sequence.

## 1) Software Architecture

-   Read these chapters from Fundamentals of Software Architecture book
    -   Preface: Invalidating Axioms
    -   1\. Introduction
    -   I. Foundations
    -   2\. Architectural Thinking
    -   3\. Modularity
    -   4\. Architecture Characteristics Defined
    -   5\. Identifying Architectural Characteristics
    -   6\. Measuring and Governing Architecture Characteristics
    -   7\. Scope of Architecture Characteristics
    -   8\. Component-Based Thinking
    -   _Make sure you are aware of the architecture styles mentioned in later chapters too_
-   Read these chapters from the Clean Architecture book
    -   12 Components
    -   13 Component Cohesion
    -   14 Component Coupling
-   Learn about making architecture diagrams with the [C4 model](https://c4model.com/)
-   Be aware of the Gang of Four Design Patterns (skim through this one and make sure to check ones you have never heard of)
-   Be aware of [Enterprise Architecture Patterns](https://ptgmedia.pearsoncmg.com/images/9780321127426/samplepages/9780321127426.pdf) (skim through this one and make sure to check ones you have never heard of)

### 1.1) Layered architecture

-   Read this article about [Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)

### 1.2) Onion architecture

-   Read this article about [The Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)

### 1.3) Clean architecture

-   Read about [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) in this blog post by Robert Martin. You can also read the book instead
-   Watch [Clean Architecture and Design](https://www.youtube.com/watch?v=2dKZ-dWaCiU)

### 1.4) Hexagonal architecture

-   Read this article about [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
-   Do the [birthday greetings Kata](http://matteo.vaccari.name/blog/archives/154) with Hexagonal Architecture (optional)

### 1.5) Domain Driven Design

-   Watch [Tackling Complexity in the Heart of Software](https://www.youtube.com/watch?v=dnUFEg68ESM)
-   Read these chapters from Domain Driven Design Quickly
    -   Chapter 1: What Is Domain-Driven Design
    -   Chapter 2: The Ubiquitous Language
    -   Chapter 3: Model-Driven Design
    -   Chapter 4: Refactoring Toward Deeper Insight
    -   Chapter 5: Preserving Model Integrity
-   If you want to dig deeper read the rest of the book and try
    -   Implementing Domain Driven Design by Vaugh Vernon
    -   Domain Driven Design by Eric Evans
-   Read this article about Martin Fowler about [Bounded Context](http://martinfowler.com/bliki/BoundedContext.html)

### 1.6) CQRS and Event Sourcing (optional)

-   Read this article on [CQRS by Martin Fowler](http://martinfowler.com/bliki/CQRS.html)
-   Article on [Event Sourcing by Martin Fowler](http://martinfowler.com/eaaDev/EventSourcing.html)
-   Watch this video by Greg Young on [CQRS and Event Sourcing](https://www.youtube.com/watch?v=JHGkaShoyNs)
-   Read pages 138 – 163 of Implementing Domain Driven Design by Vaugh Vernon

## 2) Microservices

-   Watch this introductory video [Microservices for mortals](https://www.youtube.com/watch?v=5ZSA99aq6UA)
-   Read [Introduction to Microservices • Seven-part series of articles](https://www.nginx.com/blog/introduction-to-microservices/)
-   Read these chapters from [Building Microservices](https://www.nginx.com/wp-content/uploads/2015/01/Building_Microservices_Nginx.pdf) by Sam Newman
    -   Chapter 1: Microservices
    -   Chapter 2: The Evolutionary Architect
    -   Chapter 3: How to Model Services
    -   Chapter 4: Integration
    -   Chapter 5: Splitting the Monolith
    -   Chapter 6: Deployment
    -   Chapter 7: Testing
    -   Chapter 8: Monitoring
    -   Chapter 11: Microservices at Scale
-   Watch this video [Practical Considerations For Microservice Architecture](https://vimeo.com/105751281)
-   Read [Microservice Trade-Offs](http://martinfowler.com/articles/microservice-trade-offs.html) by Martin Fowler
-   Understand all the factors in [The Twelve-Factor App](https://12factor.net/)
-   Understand observability: specifically, the [difference between Logs, Metrics and Traces](https://medium.com/@surfd1001/things-to-know-about-observability-mechanisms-a52876e421c7)
-   Watch [DDD and Microservices: At last, some boundaries!](https://vimeo.com/125769142)
-   Read [Seven Microservices Anti-patterns](https://www.infoq.com/articles/seven-uservices-antipatterns)

## 3) Continuous Delivery

-   Read these chapters from Continuous Delivery
    -   Foundations
        -   The problem of delivering software
        -   Configuration management
        -   Continuous Integration
        -   Implementing a testing strategy
    -   The deployment pipeline
        -   Anatomy of the deployment pipeline
        -   Build and deployment scripting
        -   The commit stage
        -   Automated acceptance testing
        -   Testing nonfunctional requirements
        -   Deploying and releasing applications
    -   The delivery ecosystem
        -   Managing infrastructure and environments
        -   Managing data
        -   Managing components and dependencies
        -   Advanced version control
        -   Managing continuous delivery

## 4) DevOps

-   Read these chapters from the DevOps handbook
    -   Imagine a World Where Dev and Ops Become DevOps: An Introduction to The DevOps Handbook
    -   PART I—THE THREE WAYS
        -   Part I Introduction
        -   1- Agile, Continuous Delivery, and the Three Ways
        -   2- The First Way: The Principles of Flow
        -   3- The Second Way: The Principles of Feedback
        -   4- The Third Way: The Principles of Continual Learning and Experimentation
    -   PART II—WHERE TO START
        -   Part II Introduction
        -   5- Selecting Which Value Stream to Start With
        -   6- Understanding the Work in Our Value Stream, Making it Visible, and Expanding it Across the Organization
        -   7- How to Design Our Organization and Architecture with Conway’s Law in Mind
        -   8- How to Get Great Outcomes by Integrating Operations into the Daily Work of Development
    -   PART III—THE FIRST WAY: THE TECHNICAL PRACTICES OF FLOW
        -   Part III Introduction
        -   9- Create the Foundations of Our Deployment Pipeline
        -   10- Enable Fast and Reliable Automated Testing
        -   11- Enable and Practice Continuous Integration
        -   12- Automate and Enable Low-Risk Releases
        -   13- Architect for Low-Risk Releases
    -   PART IV—THE SECOND WAY: THE TECHNICAL PRACTICES OF FEEDBACK
        -   Part IV Introduction
        -   14- Create Telemetry to Enable Seeing and Solving Problems
        -   15- Analyze Telemetry to Better Anticipate Problems and Achieve Goals
        -   16- Enable Feedback So Development and Operations Can Safely Deploy Code
        -   17- Integrate Hypothesis-Driven Development and A/B Testing into Our Daily Work
        -   18- Create Review and Coordination Processes to Increase Quality of Our Current Work

-   Read [this article by Rouan Wilsenach](https://martinfowler.com/bliki/DevOpsCulture.html) about DevOps culture
-   Read about the principles of [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code) (introduced in [this book](https://www.amazon.com/Infrastructure-Code-Managing-Servers-Cloud/dp/1491924357))
-   Read the article [There’s No Such thing as a DevOps team](https://continuousdelivery.com/2012/10/theres-no-such-thing-as-a-devops-team/)

## 5) Quality Strategy

-   Make sure you are familiar with all layers of the [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) by Martin Fowler
-   Read also about the [Swiss cheese model](https://blog.korny.info/2020/01/20/the-swiss-cheese-model-and-acceptance-tests.html) and how it relates to the test pyramid
-   Make sure you are familiar with all kinds of [Microservice testing](http://martinfowler.com/articles/microservice-testing)
-   Read these articles about the “Shift left” principle
    -   [https://gauge.org/2020/06/24/home-loan-application-user-story/](https://gauge.org/2020/06/24/home-loan-application-user-story/)
    -   [https://www.cigniti.com/blog/importance-shift-left-shift-right-testing-approaches/](https://www.cigniti.com/blog/importance-shift-left-shift-right-testing-approaches/)

## 6) Legacy Code

-   Read these chapters from Working effectively with Legacy Code
    -   Chapter 1: Changing Software
    -   Chapter 2: Working with Feedback
    -   Chapter 4: The Seam Model
    -   Chapter 8: How Do I Add a Feature ?
    -   Chapter 13: I Need to Make Changes, but I Don’t Know What Tests to Write
    -   Chapter 25: Dependency-Breaking Techniques
-   Read about covering legacy codebases through [Characterization Tests](https://michaelfeathers.silvrback.com/characterization-testing)
-   Read [Working Effectively with Legacy Tests](http://natpryce.com/articles/000813.html)
-   Watch [All the Little Things](https://www.youtube.com/watch?v=8bZh5LMaSmE)
-   Read about the [Strangler Pattern](https://microservices.io/patterns/refactoring/strangler-application.html)
-   Watch [Sandro Mancuso – Testing and Refactoring Legacy Code](https://www.youtube.com/watch?v=_NnElPO5BU0)
-   Watch [Surviving a legacy codebase: tactics and tools](https://www.youtube.com/watch?v=NGfvguzMjqw)

## 7) Mobile

-   Even if you only work on the backend, you should be familiar with the [problems with app releases](https://www.mobileatscale.com/content/posts/03-the-long-tail-of-app-versions-copy-2/)
    -   Explore how [Server Driven UI](https://www.judo.app/blog/server-driven-ui/) can solve this
    -   Or how [PWAs](https://web.dev/progressive-web-apps/) can solve it

## 8) Team and Communication

-   Read about the [5 dysfunctions of a team](https://high5test.com/dysfunctions-of-a-team/) (based on [the book](https://www.amazon.com/Five-Dysfunctions-Team-Leadership-Fable/dp/0787960756))
-   Read the Crucial Conversations book
-   Read about the characteristics of [High performing teams](https://www.forbes.com/sites/brentgleeson/2019/03/14/15-characteristics-of-high-performance-teams/?sh=2e4cf4f96ae0)
-   Watch this video about [Drive](https://www.youtube.com/watch?v=u6XAPnuFjJc)
-   Read about [Cognitive biases](https://www.visualcapitalist.com/50-cognitive-biases-in-the-modern-world/)

### [Next: Lead Developers →](/blog/an-agile-study-path-for-lead-developers/)

#### [← Previous: Junior to Mid Level Developers](/blog/an-agile-study-path-for-junior-to-mid-level-developers/)

### Table of Contents:

1.  [Junior to Mid Level Developers](/blog/an-agile-study-path-for-junior-to-mid-level-developers/)
2.  [Senior Developers](/blog/an-agile-study-path-for-senior-developers/)
3.  [Lead Developers](/blog/an-agile-study-path-for-lead-developers/)
