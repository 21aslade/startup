import { useLocation } from "react-router-dom";
import { styled } from "styled-components";

const Centered = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default function NotFound() {
    const location = useLocation();

    return (
        <Centered>
            <div>
                <h1>404: Not found</h1>
                <p>
                    The requested URL <b>{location.pathname}</b> was not found.
                </p>
            </div>
        </Centered>
    );
}
