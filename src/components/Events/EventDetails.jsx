import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isError: deleteIsError,
    error: deleteError,
    isPending: deleteIsPending,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const startIsDeleting = () => {
    setIsDeleting(true);
  };

  const stopIsDeleting = () => {
    setIsDeleting(false);
  };

  const deleteHandler = () => {
    mutate({ id: id });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={stopIsDeleting}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete {data.title} ? this action cannot be
            undone
          </p>
          <div className="form-actions">
            {deleteIsPending && <p>Deleting, please wait...</p>}
            {!deleteIsPending && (
              <>
                <button onClick={stopIsDeleting} className="button-text">
                  Cancel
                </button>
                <button onClick={deleteHandler} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {deleteIsError && (
            <ErrorBlock
              title={"Failed"}
              message={
                deleteError.info?.message ||
                "An error occured, please try again later"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {isPending && (
        <div id="event-details-content" className="center">
          {" "}
          <p>Fetching event data...</p>
        </div>
      )}

      <div id="event-details-content" className="center">
        {isError && (
          <ErrorBlock
            title={"failed"}
            message={error.info?.message || "An error occured please try again"}
          />
        )}
      </div>

      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={startIsDeleting}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{`${new Date(
                  data.date
                ).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} @ ${data.time}`}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
