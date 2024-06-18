import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
// import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();

  const isSubmitting = navigation.state === "submitting";

  const { id } = useParams();

  const {
    data,
    // isPending: loadIsPending,
    isError: loadIsError,
    error: loadError,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,

  //   onMutate: async (data) => {
  //     const newData = data.event;
  //     await queryClient.cancelQueries({ queryKey: ["events", id] });
  //     const previousData = queryClient.getQueryData(["events", id]);
  //     queryClient.setQueryData(["events", id], newData);

  //     return { previousData };
  //   },

  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", id], context.previousData);
  //   },

  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events", id] });
  //   },
  //   // onSuccess: () => {
  //   //   queryClient.invalidateQueries({ queryKey: ["events", id] });
  //   //   navigate("/events/" + id);
  //   // },
  // });

  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  // if (loadIsPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

  if (loadIsError) {
    content = (
      <>
        <ErrorBlock
          title={"Failed"}
          message={
            loadError.info?.message || "An error occured please try again"
          }
        />
        <div className="form-actions">
          <Link to={"../"} className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {isSubmitting ? (
          <p className="button-text">updating event...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export const loader = async ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal, queryKey }) => fetchEvent({ signal, ...queryKey[1] }),
  });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedFormData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedFormData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
};
