export const ACTIVE_BRAND = "IvaMusic"; // Change this to switch brands

export const BRANDS = {
    IvaMusic: {
        name: "Iva Music",
        colors: {
            primary: "#b52b85",
            primaryHover: "#fdf2f8"
        },
        images: {
            background: "url('flowers.jpg')"
        }
    },
    BungySingers: {
        name: "Bungy Singers",
        colors: {
            primary: "#2b5ab5", // Blue for Bungy Singers
            primaryHover: "#f2f5fd"
        },
        images: {
            background: "url('bungy.png')"
        }
    }
};

export const getBrandConfig = () => BRANDS[ACTIVE_BRAND];
