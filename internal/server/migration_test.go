package server

import (
	"context"
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.flipt.io/flipt/internal/common"
	"go.flipt.io/flipt/rpc/flipt"
	"go.uber.org/zap/zaptest"
)

func TestDeleteAllContents(t *testing.T) {
	var (
		store  = &common.StoreMock{}
		logger = zaptest.NewLogger(t)
		s      = &Server{
			logger: logger,
			store:  store,
		}
	)

	store.On("DeleteAllContents", mock.Anything).Return(nil)
	_, err := s.DeleteAllContents(context.TODO(), &flipt.DeleteAllContentsRequest{})
	require.NoError(t, err)
}
