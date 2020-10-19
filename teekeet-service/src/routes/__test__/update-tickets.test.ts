import request from "supertest";
import { app } from "../../app";
import { createDummyTicket } from "./test-base.test";
import { removeCurrencyFormatting } from "../../utils/currency-utils";
import { ticketUpdatedPublisher } from "../../events/publishers/ticket-updated-publisher";

it("Rejects update request for unauthenticated user", async () => {
  // Update fake ticket
  await request(app).put("/api/tickets/1234asdf").send({}).expect(401);
});

it("Rejects update request for ticket owned by another user", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update title and price data
  const originalTitle: string = ticket.title;
  const originalPrice: String = ticket.price;
  const newTitle: string = `${ticket.title} 1`;
  const newPrice: string = "R30.00";

  // Update ticket owned by another user
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(401);

  // Get fake ticket
  const response = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .expect(200);

  // Validate ticket info
  expect(response.body.title).toEqual(originalTitle);
  expect(response.body.price).toEqual(
    removeCurrencyFormatting(originalPrice.toString())
  );
});

it("Accepts requests on /api/tickets/", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update title and price data
  const newTitle = `${ticket.title} 1`;
  const newPrice = "R30.00";

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser(ticket.userID))
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  // Get fake ticket
  const response = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .expect(200);

  // Validate ticket info
  expect(response.body.title).toEqual(newTitle);
  expect(response.body.price).toEqual(removeCurrencyFormatting(newPrice));
});

it("Rejects update request with missing id", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put("/api/tickets/")
    .set("Cookie", global.signInTestUser())
    .send({
      title: "Reject me",
      price: "R30.00",
    })
    .expect(404);
});

it("Rejects update request with missing title", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      price: "R30.00",
    })
    .expect(400);
});

it("Rejects update request with negative price", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      title: "Reject me",
      price: "-R30.00",
    })
    .expect(400);
});

it("Rejects update request with missing currency symbol", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      title: "Reject me",
      price: "50.00",
    })
    .expect(400);
});

it("Rejects update request with wrong currency", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      title: "Reject me",
      price: "$40.00",
    })
    .expect(400);
});

it("Rejects update request with missing price", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({
      title: "Reject me",
    })
    .expect(400);
});

it("Rejects update request with missing title and price", async () => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser())
    .send({})
    .expect(400);
});

it("Publishes an event when a ticket is updated", async() => {
  // Create fake ticket
  const ticket = (await createDummyTicket().expect(201)).body;

  // Update title and price data
  const newTitle = `${ticket.title} 1`;
  const newPrice = "R30.00";

  // Update fake ticket
  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set("Cookie", global.signInTestUser(ticket.userID))
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  expect(ticketUpdatedPublisher.publishEvent).toHaveBeenCalled();
});