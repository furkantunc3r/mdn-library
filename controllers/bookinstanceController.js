const BookInstance = require("../models/bookinstance");
const Book = require("../models/book")
const asyncHandler = require("express-async-handler");
const {
    body,
    validationResult
} = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();

    res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: allBookInstances,
    });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id, "imprint status due_back").populate("book").exec();

    if (bookInstance === null) {
        const err = new Error("No instance found");
        err.status = 404;
        return next(err);
    }

    res.render("book_instance_detail", {
        title: "Book Instance",
        book_instance: bookInstance
    });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").sort({
        title: 1
    }).exec();

    res.render("bookinstance_form", {
        title: "Create Bookinstance",
        book_list: allBooks
    });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body("book", "Book must be specified").trim().isLength({
        min: 1
    }).escape(),
    body("imprint", "Imprint must be specified").trim().isLength({
        min: 1
    }).escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            const allBooks = await Book.find({}, "title").sort({
                title: 1
            }).exec();

            res.render("bookinstance_form", {
                title: "Create Bookinstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookInstance: bookInstance,
            });

            return;
        } else {
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id, "book").populate("book").exec();

    if (bookInstance === null) {
        res.redirect("/catalog/books");
    }

    res.render("book_instance_delete", {
        title: "Delete Book Instance",
        bookInstance: bookInstance
    });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id, "book").populate("book").exec();

    await BookInstance.findByIdAndDelete(req.body.bookInstanceId);
    res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const [bookList, bookInstance] = await Promise.all([
        Book.find().exec(),
        BookInstance.findById(req.params.id).populate("book").exec(),
    ]);

    if (bookInstance === null) {
        const err = new Error("BookInstance not found");

        err.status = 404;

        return next(err);
    }

    res.render("bookinstance_form", {
        title: "Update BookInsance",
        book_list: bookList,
        book_instance: bookInstance,
        selected_book: bookInstance.book._id
    });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body("book", "Book must be specified").trim().isLength({
        min: 1
    }).escape(),
    body("imprint", "Imprint must be specified").trim().isLength({
        min: 1
    }).escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
    .optional({
        values: "falsy"
    })
    .isISO8601()
    .toDate(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            const allBooks = await Book.find({}, "title").sort({
                title: 1
            }).exec();

            res.render("bookinstance_form", {
                title: "Create Bookinstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookInstance: bookInstance,
            });

            return;
        } else {
            const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});

            res.redirect(updatedBookInstance.url);
        }
    }),
];