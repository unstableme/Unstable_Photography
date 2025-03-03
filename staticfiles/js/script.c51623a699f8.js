document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menu-button");
    const sidebar = document.querySelector(".sidebar");
    const sidebarLinks = document.querySelectorAll(".sidebar a[data-page]"); // Only select internal page links

    menuButton.addEventListener("click", function (event) {
        event.stopPropagation();
        sidebar.classList.toggle("sidebar-open");
    });

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !menuButton.contains(event.target)) {
            sidebar.classList.remove("sidebar-open");
        }
    });

    // Handle sidebar link clicks
    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default behavior
            const page = this.getAttribute("data-page"); // Get page name
            loadContent(page); // Load the corresponding content

            if (window.innerWidth <= 767) { // Close sidebar only on mobile view
                sidebar.classList.remove("sidebar-open");
            }
        });
    });



    // Existing content loading logic (unchanged)
    const folders = document.querySelectorAll(".folder");
    const galleryContainer = document.getElementById("gallery-container");
    //const mainContent = document.getElementById("main-content");
    const sortButtons = document.querySelector(".sort-buttons");
    const cameraSection = document.getElementById("camera-section");
    const aboutSection = document.getElementById("about-section");
    const contactSection = document.getElementById("contact-section");

    // Image Modal Variables
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentIndex = 0;
    let images = [];

    // Open folders to show images
    folders.forEach(folder => {
        folder.addEventListener("click", function () {
            const groupId = folder.getAttribute("data-name");
            history.pushState({ group: groupId }, "", `?group=${groupId}`);
            showGroup(groupId);
        });
    });

    function showGroup(groupId) {
        document.querySelectorAll(".gallery-group").forEach(group => {
            group.style.display = "none";
        });

        const selectedGroup = document.querySelector(`[data-name="${groupId}"]`).closest(".gallery-group");
        if (selectedGroup) {
            selectedGroup.style.display = "block";
            selectedGroup.querySelector(".gallery-items").style.display = "grid";
        }
    }

    window.addEventListener("popstate", function (event) {
        if (event.state && event.state.group) {
            showGroup(event.state.group);
        } else {
            document.querySelectorAll(".gallery-group").forEach(group => {
                group.style.display = "block";
                group.querySelector(".gallery-items").style.display = "none";
            });
        }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.has("group")) {
        showGroup(params.get("group"));
    }

    window.loadContent = function (page) {
        galleryContainer.style.display = "none";
        sortButtons.style.display = "none";
        //mainContent.style.display = "none";
        cameraSection.style.display = "none";
        aboutSection.style.display = "none";
        contactSection.style.display = "none";

        if (page === "home") {
            galleryContainer.style.display = "block";
            sortButtons.style.display = "block";
            //mainContent.style.display = "block";
            //mainContent.innerHTML = "<h1></h1>";
        } else if (page === "camera") {
            cameraSection.style.display = "block";
        } else if (page === "about") {
            aboutSection.style.display = "block";
        } else if (page === "contact") {
            contactSection.style.display = "block";
        } else {
            //mainContent.style.display = "block";
            //mainContent.innerHTML = "<h1>404</h1><p>Page not found.</p>";
        }
    };

    // ** Image Modal Logic (Folder-Specific) ** //
    document.querySelectorAll(".gallery-group").forEach(group => {
        const imagesInGroup = group.querySelectorAll(".gallery-item img");

        imagesInGroup.forEach((img, index) => {
            img.addEventListener("click", function () {
                // Get only images from this specific folder
                images = Array.from(imagesInGroup);
                currentIndex = index;
                openModal(images[currentIndex].src);
            });
        });
    });

    function openModal(src) {
        modal.style.display = "block";
        modalImg.src = src;
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        modalImg.src = images[currentIndex].src;
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        modalImg.src = images[currentIndex].src;
    }

    closeBtn.addEventListener("click", closeModal);
    nextBtn.addEventListener("click", nextImage);
    prevBtn.addEventListener("click", prevImage);

    window.addEventListener("keydown", function (e) {
        if (modal.style.display === "block") {
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "Escape") closeModal();
        }
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });
});
