export const ACTIVE_BRAND = "Bungy"; // Change this to switch brands

export const BRANDS = {
    Iva: {
        name: "Iva Music",
        colors: {
            primary: "#b52b85",
            primaryHover: "#fdf2f8"
        },
        images: {
            background: "url('flowerss.jpg')",//"linear-gradient(135deg, var(--primary-hover), var(--primary-hover))",
            icon: "dog.png",
            backgroundAlpha: 0.2
        }
    },
    Bungy: {
        name: "Bungy Singers",
        colors: {
            primary: "#b52b85",
            primaryHover: "#fdf2f8"
        },
        images: {
            background: "url('bungy.png')",//"linear-gradient(135deg, var(--primary), var(--primary-hover))",
            icon: "bungy.png",
            backgroundAlpha: 0.2
        }
    }
};

export const getBrandConfig = () => BRANDS[ACTIVE_BRAND];
